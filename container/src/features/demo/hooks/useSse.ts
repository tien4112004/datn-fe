import { useState, useEffect } from 'react';

function useServerSentEvents(url: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    eventSource.onerror = (error: any) => {
      setError(error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, error };
}

export default useServerSentEvents;
