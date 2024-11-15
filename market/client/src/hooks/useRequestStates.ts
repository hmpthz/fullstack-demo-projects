import { useState } from 'react';
import { getErrorMessage } from '@/utils/error';

export function useRequestStates(initialLoading: string | boolean) {
  const [loading, setLoading] = useState<string | boolean>(initialLoading);
  const [hasError, setError] = useState<string>();

  function onSuccess() {
    setLoading(false);
    setError(undefined);
  }
  function onError(err: unknown) {
    setLoading(false);
    setError(getErrorMessage(err));
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