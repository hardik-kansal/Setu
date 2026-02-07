import { ActionFn, Context, Event, TransactionEvent } from '@tenderly/actions';
import { ethers } from 'ethers';

export const handleBridgeUnlock: ActionFn = async (context: Context, event: Event) => {
  const txEvent = event as TransactionEvent;
  
  // 1. Get secrets from Tenderly Dashboard (Private Key & RPC)
  const privateKey = await context.secrets.get('RELAYER_PK');
  const rpcUrl = await context.secrets.get('DESTINATION_RPC');
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // 2. Define the Target Contract (SetuVault on the destination chain)
  const vaultAddress = "0xYourDeployedVaultAddress"; 
  const vaultAbi = ["function unlock(address _user, uint256 _amount, uint256 _src) external"];
  const vault = new ethers.Contract(vaultAddress, vaultAbi, wallet);

  // 3. Extract data from the BridgeInitiated event
  // Assume the event has: user, amount, sourceChainId
  const { user, amount, sourceChainId } = txEvent.logs[0].data;

  // 4. Execute the Unlock on the destination chain
  const tx = await vault.unlock(user, amount, sourceChainId);
  await tx.wait();
  
  console.log(`Relayed bridge from ${sourceChainId} for user ${user}`);
};