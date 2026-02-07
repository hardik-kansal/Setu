// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract SetuVault is ERC20, Ownable, ReentrancyGuard {
    IERC20 public usdc;
    IPool public aavePool;
    address public aUsdc;
    address public tenderlyRelayer;

    struct Lock {
        uint256 lpAmount;    // zLP shares
        uint256 unlockTime;  // Midnight UTC timestamp
    }

    mapping(address => Lock) public userLock;
    mapping(uint256 => bool) public authorizedSourceChains;

    uint256 constant SECONDS_IN_DAY = 86400;

    constructor(address _usdc, address _aavePool, address _aUsdc, address _relayer) 
        ERC20("Setu LP Token", "zLP") Ownable(msg.sender) 
    {
        usdc = IERC20(_usdc);
        aavePool = IPool(_aavePool);
        aUsdc = _aUsdc;
        tenderlyRelayer = _relayer;
    }

    // --- Core Functions ---

    function bridge(uint256 _amount) external nonReentrant {
        usdc.transferFrom(msg.sender, address(this), _amount);
        _supplyToAave(_amount);
        emit BridgeInitiated(msg.sender, _amount, block.chainid);
    }

    function depositLP(uint256 _amount, uint256 _days) external nonReentrant {
        require(_days > 0, "Setu: Min 1 day");
        uint256 assets = totalAssets();
        uint256 supply = totalSupply();
        uint256 shares = (supply == 0) ? _amount : (_amount * supply) / assets;

        uint256 startOfToday = (block.timestamp / SECONDS_IN_DAY) * SECONDS_IN_DAY;
        uint256 newUnlockTime = startOfToday + ((_days + 1) * SECONDS_IN_DAY);

        userLock[msg.sender].lpAmount += shares;
        userLock[msg.sender].unlockTime = newUnlockTime;

        usdc.transferFrom(msg.sender, address(this), _amount);
        _supplyToAave(_amount);
        _mint(msg.sender, shares);
    }

    function withdrawLP() external nonReentrant {
        Lock storage lock = userLock[msg.sender];
        require(lock.lpAmount > 0, "No balance");
        require(block.timestamp >= lock.unlockTime, "Still locked");

        uint256 amountToReturn = getUSDCValue(msg.sender);
        uint256 sharesToBurn = lock.lpAmount;

        lock.lpAmount = 0;
        lock.unlockTime = 0;
        
        _burn(msg.sender, sharesToBurn);
        aavePool.withdraw(address(usdc), amountToReturn, msg.sender);
    }

    // --- FRONTEND HELPER FUNCTIONS ---

    /**
     * @notice Returns the total USDC controlled by this contract (Principal + Yield).
     */
    function totalAssets() public view returns (uint256) {
        return IERC20(aUsdc).balanceOf(address(this));
    }

    /**
     * @notice Returns the current value of a user's LP shares in USDC.
     * Use this to show: "Your current balance is $105.20"
     */
    function getUSDCValue(address _user) public view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return (userLock[_user].lpAmount * totalAssets()) / totalSupply();
    }

    /**
     * @notice Returns the timestamp of the user's midnight unlock.
     * Use this for: "Unlocks on July 26, 2026 at 00:00 UTC"
     */
    function getUnlockTimestamp(address _user) external view returns (uint256) {
        return userLock[_user].unlockTime;
    }

    /**
     * @notice Returns the number of seconds remaining until the user can withdraw.
     * Use this for a real-time countdown timer in React.
     */
    function getTimeLeft(address _user) external view returns (uint256) {
        if (block.timestamp >= userLock[_user].unlockTime) return 0;
        return userLock[_user].unlockTime - block.timestamp;
    }

    /**
     * @notice Helper to check if the user is currently allowed to withdraw.
     * Use this to enable/disable the "Withdraw" button.
     */
    function canWithdraw(address _user) external view returns (bool) {
        return (userLock[_user].lpAmount > 0 && block.timestamp >= userLock[_user].unlockTime);
    }

    // --- System Functions ---

    function unlock(address _user, uint256 _amount, uint256 _src) external {
        require(msg.sender == tenderlyRelayer, "Unauthorized");
        aavePool.withdraw(address(usdc), _amount, _user);
    }

    function _supplyToAave(uint256 _amount) internal {
        usdc.approve(address(aavePool), _amount);
        aavePool.supply(address(usdc), _amount, address(this), 0);
    }

    event BridgeInitiated(address indexed user, uint256 amount, uint256 sourceChainId);
}