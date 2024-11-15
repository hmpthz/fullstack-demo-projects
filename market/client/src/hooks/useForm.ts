import { useState, type ChangeEvent } from 'react';

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [formData, setFormData] = useState<T>(initial);

  function register(prop: keyof T) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
      setFormData({ ...formData, [prop]: e.target.value });
    }
    return {
      onChange,
      value: formData[prop]
    };
  }

  return {
    formData,
    register
  };
}