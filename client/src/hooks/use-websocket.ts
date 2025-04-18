
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useWebSocket() {
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CONTENT_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      }
    };

    return () => {
      ws.close();
    };
  }, []);
}
