'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UpcomingUnlocksDisplay() {
  // Hardcoded small value for now
  const unlockData = {
    total_volume: 127.50,
    unlock_count: 3,
    chain_a_volume: 64.25,
    chain_b_volume: 63.25,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>24h Upcoming Unlocks</CardTitle>
        <CardDescription>Total volume unlocking in the next 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">${unlockData.total_volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unlock Count</p>
            <p className="text-2xl font-bold">{unlockData.unlock_count}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Chain A Volume</p>
            <p className="text-xl font-semibold">${unlockData.chain_a_volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chain B Volume</p>
            <p className="text-xl font-semibold">${unlockData.chain_b_volume.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
