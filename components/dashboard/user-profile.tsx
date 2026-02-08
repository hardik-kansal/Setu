'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { mainnet } from 'wagmi/chains';
import { User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function UserProfile() {
  const { address, isConnected } = useAccount();
  
  // Fetch ENS name and avatar (using mainnet for ENS)
  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  if (!isConnected || !address) {
    return (
      <Card className="bg-gradient-to-br from-slate-950/50 to-slate-900/50 border-slate-700/30">
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <User className="h-12 w-12 text-slate-600" />
            <p className="text-sm">Connect wallet to view profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            <span>User Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-purple-500/50">
              <AvatarImage src={ensAvatar || undefined} alt={ensName || 'User'} />
              <AvatarFallback className="bg-purple-500/20 text-purple-400">
                {ensName ? ensName.slice(0, 2).toUpperCase() : address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              {ensName ? (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{ensName}</h3>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <code className="text-xs text-muted-foreground block">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </code>
                </>
              ) : (
                <code className="text-sm font-mono">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </code>
              )}
              
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                {ensName ? 'ENS Verified' : 'Wallet Connected'}
              </Badge>
            </div>
          </div>
          
          <div className="pt-4 border-t border-purple-500/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Network</p>
                <p className="font-semibold">Sepolia + Base</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Role</p>
                <p className="font-semibold">Operator</p>
              </div>
            </div>
          </div>
          
          {ensName && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-xs text-purple-400/80">
                🎯 Your ENS identity is displayed throughout the interface, replacing wallet addresses for better UX.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
