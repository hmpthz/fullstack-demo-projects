/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ChangeEvent } from 'react';

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [formData, setFormData] = useState<T>(initial);

  function setFormValue<K extends keyof T>(prop: K, value: T[K]) {
    if (formData[prop] != value) {
      setFormData({ ...formData, [prop]: value });
    }
  }

  function register<K extends keyof T>(prop: K) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
      // eslint-disable-next-line
      setFormValue(prop, e.target.value as any);
    }
    return {
      onChange,
      value: formData[prop]
    };
  }

  function stripUnchanged(): [Partial<T>, number] {
    const newData: Record<string, unknown> = {};
    let nChanged = 0;
    for (const [key, value] of Object.entries(formData)) {
      if (value != initial[key]) {
        newData[key] = value;
        nChanged++;
      }
    }
    return [newData as Partial<T>, nChanged];
  }

  function resetForm() {
    setFormData({ ...initial });
  }

  return {
    formData,
    register,
    setFormValue,
    stripUnchanged,
    resetForm
  };
}