import { ActionFn, Context, Event, TransactionEvent, Network } from '@tenderly/actions';
import { ethers } from 'ethers';

/**
 * SETU RELAYER: Cross-Chain Bridge Handler
 * Listens for 'BridgeInitiated' and triggers 'unlock' on the destination chain.
 */
export const handleBridge: ActionFn = async (context: Context, event: Event) => {
  const txEvent = event as TransactionEvent;
  const sourceNetwork = txEvent.network;

  console.log(`[Setu] New Bridge Event detected on Network: ${sourceNetwork}`);

  // 1. Determine the Routing Logic
  // Eth Sepolia: 11155111 | Base Sepolia: 84532
  const isFromL1 = sourceNetwork === "11155111";
  const targetNetwork = isFromL1 ? Network.BASE_SEPOLIA : Network.SEPOLIA;
  
  // Replace these with your deployed SetuVault Proxy addresses
  const targetVaultAddress = isFromL1 
    ? "0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2" // Your Base Vault
    : "0x010a712748b9903c90deec684f433bae57a67476"; // Your Eth Vault

  // 2. Extract and Decode Event Data
  // We look for the 'BridgeInitiated(address user, uint256 amount, uint256 sourceChainId)'
  const bridgeInitiatedTopic = ethers.id("BridgeInitiated(address,uint256,uint256)");
  const bridgeLog = txEvent.logs.find(
    (log: { topics?: string[] }) => log.topics?.[0] === bridgeInitiatedTopic
  );

  if (!bridgeLog) {
    console.error("Critical: BridgeInitiated log not found in transaction.");
    return;
  }

  // Ethers v6 decoding
  const abiCoder = new ethers.AbiCoder();
  // Topics[0] is the event signature. Data contains the params.
  const decodedData = abiCoder.decode(
    ["address", "uint256", "uint256"], 
    bridgeLog.data
  );

  const user = decodedData[0];
  const amount = decodedData[1];

  console.log(`[Relaying] User: ${user} | Amount: ${ethers.formatUnits(amount, 6)} USDC`);

  // 3. Initialize Target Provider & Signer
  const privateKey = await context.secrets.get('RELAYER_PK');
  const gatewayUrl = context.gateways.getGateway(targetNetwork);
  const provider = new ethers.JsonRpcProvider(gatewayUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // 4. Execute the 'Unlock' on Destination
  const vaultAbi = ["function unlock(address _user, uint256 _amount) external"];
  const vaultContract = new ethers.Contract(targetVaultAddress, vaultAbi, wallet);

  try {
    console.log(`[Target] Sending unlock transaction to ${targetVaultAddress} on ${targetNetwork}...`);
    
    // Gas Override: Ensuring transaction goes through on congested testnets
    const tx = await vaultContract.unlock(user, amount, {
      gasLimit: 200000
    });
    
    const receipt = await tx.wait();
    console.log(`[Success] Bridge Complete! Hash: ${receipt.hash}`);
  } catch (error) {
    console.error("[Error] Failed to unlock on destination:", error);
    throw error; // Re-throwing allows Tenderly to mark the execution as "Failed" for debugging
  }
};