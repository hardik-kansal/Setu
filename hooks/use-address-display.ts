import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

/**
 * Hook to resolve an Ethereum address to its ENS name
 */
export function useAddressDisplay(address: string | undefined) {
  const { data: ensName, isLoading } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id,
  });

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');
  
  return {
    displayName,
    ensName,
    isLoading,
    hasEns: !!ensName,
  };
}
