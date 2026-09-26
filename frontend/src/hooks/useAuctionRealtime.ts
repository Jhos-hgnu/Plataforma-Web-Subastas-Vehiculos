import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import type { AuctionState } from '../types';

export function useAuctionRealtime(auctionId?: string) {
  const [state, setState] = useState<AuctionState | null>(null);
  const [loading, setLoading] = useState(Boolean(auctionId));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!auctionId) return;
    setLoading(true);
    const unsubscribe = onValue(ref(database, `auctionStates/${auctionId}/public`), (snapshot) => {
      setState(snapshot.val() as AuctionState | null); setLoading(false);
    }, () => { setError('No se pudo actualizar la subasta en tiempo real.'); setLoading(false); });
    return unsubscribe;
  }, [auctionId]);
  return { state, loading, error };
}
