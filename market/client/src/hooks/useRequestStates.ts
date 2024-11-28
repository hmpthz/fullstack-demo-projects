import { useState } from 'react';

export type Alert = {
  error?: string,
  success?: string
}
export function useRequestStates(initial: { loading: string | boolean } & Alert) {
  const [loading, setLoading] = useState<string | boolean>(initial.loading);
  const [alert, setAlert] = useState<Alert>({ error: initial.error, success: initial.success });

  function setError(errMsg?: string) {
    setAlert({ error: errMsg, success: undefined });
  }
  function setSuccess(successMsg?: string) {
    setAlert({ error: undefined, success: successMsg });
  }
  function onSuccess(successMsg?: string) {
    setLoading(false);
    setSuccess(successMsg);
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
    hasError: alert.error, setError,
    success: alert.success, setSuccess,
    onSuccess, onError, onSend
  };
}