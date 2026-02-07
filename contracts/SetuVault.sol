// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @dev Compound V3 (Comet) Interface
 */
interface IComet {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function baseToken() external view returns (address);
}

contract SetuVault is ERC20, Ownable, ReentrancyGuard {
    IComet public comet;
    IERC20 public usdc;
    address public tenderlyRelayer;

    struct Lock {
        uint256 lpAmount;    // zLP shares
        uint256 unlockTime;  // Midnight UTC timestamp
    }

    mapping(address => Lock) public userLock;
    uint256 constant SECONDS_IN_DAY = 86400;

    constructor(address _comet, address _relayer) 
        ERC20("Setu LP Token", "zLP") Ownable(msg.sender) 
    {
        comet = IComet(_comet);
        usdc = IERC20(comet.baseToken()); // Automatically fetch USDC from Comet
        tenderlyRelayer = _relayer;
    }

    // --- Core Functions ---

    function bridge(uint256 _amount) external nonReentrant {
        usdc.transferFrom(msg.sender, address(this), _amount);
        _supplyToCompound(_amount);
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
        _supplyToCompound(_amount);
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
        
        // Compound V3 withdraw sends tokens to THIS contract
        comet.withdraw(address(usdc), amountToReturn);
        usdc.transfer(msg.sender, amountToReturn);
    }

    // --- FRONTEND HELPERS ---

    function totalAssets() public view returns (uint256) {
        // Compound V3 balanceOf(address) returns principal + accrued interest
        return comet.balanceOf(address(this));
    }

    function getUSDCValue(address _user) public view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return (userLock[_user].lpAmount * totalAssets()) / totalSupply();
    }

    // --- System Functions ---

    function unlock(address _user, uint256 _amount, uint256 _src) external {
        require(msg.sender == tenderlyRelayer, "Unauthorized");
        comet.withdraw(address(usdc), _amount);
        usdc.transfer(_user, _amount);
    }

    function _supplyToCompound(uint256 _amount) internal {
        usdc.approve(address(comet), _amount);
        comet.supply(address(usdc), _amount);
    }

    event BridgeInitiated(address indexed user, uint256 amount, uint256 sourceChainId);
}

// base-sepolia


// 0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2

// comet - 0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017

// relayer - 0x4f4Ed8D7DE8590ED7597b8099a474E243EFC0C94



// eth - sepolia

// 0x4f4Ed8D7DE8590ED7597b8099a474E243EFC0C94
// comet - 0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e

