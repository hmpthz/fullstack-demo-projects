import { useState } from 'react';

export function useRequestStates(initialLoading: string | boolean, initialError?: string) {
  const [loading, setLoading] = useState<string | boolean>(initialLoading);
  const [hasError, setError] = useState(initialError);

  function onSuccess() {
    setLoading(false);
    setError(undefined);
  }
  function onError(errMsg: string) {
    setLoading(false);
    setError(errMsg);
  }
  function onSend(loading: string | true) {
    setLoading(loading);
    setError(undefined);
  }

  return {
    loading, setLoading,
    hasError, setError,
    onSuccess, onError, onSend
  };
}