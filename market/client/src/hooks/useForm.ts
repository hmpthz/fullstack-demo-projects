import { useState, type ChangeEvent } from 'react';

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [formData, setFormData] = useState<T>(initial);

  function setFormValue(prop: keyof T, value: unknown) {
    if (formData[prop] != value) {
      setFormData({ ...formData, [prop]: value });
    }
  }

  function register<P extends keyof T>(prop: P) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
      setFormValue(prop, e.target.value);
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

  return {
    formData,
    register,
    setFormValue,
    stripUnchanged
  };
}