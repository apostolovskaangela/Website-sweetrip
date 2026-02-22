import React from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import Offline, { type OfflineRequest } from '@/src/services/offline';
import { queryKeys } from '@/src/lib/queryKeys';

const QUEUE_KEY = 'OFFLINE_QUEUE_V1';

function loadQueue(): OfflineRequest[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineRequest[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(items: OfflineRequest[]) {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function OfflineQueuePage() {
  const qc = useQueryClient();
  const [items, setItems] = React.useState<OfflineRequest[]>(() => loadQueue());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = window.setInterval(() => setItems(loadQueue()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const retry = async (id: string) => {
    setError(null);
    try {
      await Offline.processQueueItem(id);
      qc.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
      setItems(loadQueue());
    } catch (e: any) {
      setError(e?.message ?? 'Retry failed');
    }
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    saveQueue(next);
    setItems(next);
  };

  const clearAll = async () => {
    if (!window.confirm('Remove all pending offline requests?')) return;
    await Offline.clearQueue();
    setItems(loadQueue());
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Offline queue
          </Typography>
          <Typography color="text.secondary">Pending requests to sync when you’re back online.</Typography>
        </Box>
        <Button variant="outlined" onClick={clearAll} disabled={items.length === 0}>
          Clear all
        </Button>
      </Box>

      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography color="text.secondary">No pending requests.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {items.map((i) => (
            <Card key={i.id} variant="outlined">
              <CardContent>
                <Typography sx={{ fontWeight: 900 }}>
                  {i.method} {i.url}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(i.timestamp).toLocaleString()}
                </Typography>
                {!!i.body && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Body
                    </Typography>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(i.body, null, 2)}</pre>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => retry(i.id)}>
                    Retry
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => remove(i.id)}>
                    Remove
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

