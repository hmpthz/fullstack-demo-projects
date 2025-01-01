/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, type ChangeEvent } from 'react';

type InputGetter = (this: RegisteredInput) => any;
type InputSetter = (this: RegisteredInput, value: any) => void;

type RegisteredInput = {
  ref: HTMLInputElement,
  getValue: InputGetter,
  setValue: InputSetter
}
function getTextValue(this: RegisteredInput) {
  return this.ref.value;
}
function getNumberValue(this: RegisteredInput) {
  return parseFloat(this.ref.value);
}
function setAnyValue(this: RegisteredInput, value: any) {
  this.ref.value = value;
}
function getCheckValue(this: RegisteredInput) {
  return this.ref.checked;
}
function setCheckValue(this: RegisteredInput, value: any) {
  this.ref.checked = value;
}
function getRadioValue(this: RegisteredInput) {
  return this.ref.checked ? this.ref.value : null;
}
function setRadioValue(this: RegisteredInput, value: any) {
  this.ref.checked = value === this.ref.value;
}

type FormControl<T> = {
  data: T,
  dirtyFields: Partial<Record<keyof T, true>>
}
type RegisterOptions = {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
  rerender?: boolean
}

export function useForm<T extends Record<string, any>>(initial: T) {
  // manage a ref instead of controlled input by useState
  const _formControl = useRef<FormControl<T>>({
    data: { ...initial }, dirtyFields: {}
  });
  const { data: formData, dirtyFields } = _formControl.current;
  const [_formState, updateFormState] = useState({});

  type InputCollection = Record<keyof T, RegisteredInput | RegisteredInput[]>;
  const _inputs = {} as InputCollection;

  function register<K extends keyof T>(prop: K, opts?: RegisterOptions) {
    const item = {} as RegisteredInput;
    {
      const prevItems = _inputs[prop];
      if (prevItems) {
        if (!Array.isArray(prevItems)) {
          _inputs[prop] = [prevItems, item];
        }
        else {
          prevItems.push(item);
        }
      }
      else {
        _inputs[prop] = item;
      }
    }

    function onChange(e: ChangeEvent<HTMLInputElement>) {
      const val = item.getValue();
      if (val != null) {
        formData[prop] = val;
        dirtyFields[prop] = true;
        if (opts?.rerender) {
          updateFormState({});
        }
      }
      opts?.onChange?.(e);
    }
    function ref(ele: HTMLInputElement | null) {
      if (!ele) return;
      item.ref = ele;
      if (ele.type == 'checkbox') {
        item.getValue = getCheckValue; item.setValue = setCheckValue;
      }
      else if (ele.type == 'radio') {
        item.getValue = getRadioValue; item.setValue = setRadioValue;
      }
      else {
        item.getValue = ele.type == 'number' ? getNumberValue : getTextValue; item.setValue = setAnyValue;
      }
      if (initial[prop] && dirtyFields[prop] !== true) {
        item.setValue(initial[prop]);
      }
      else if (formData[prop] && dirtyFields[prop] === true) {
        item.setValue(formData[prop]);
      }
    }
    return { onChange, ref, name: prop as string };
  }

  function resetForm(data?: T) {
    data ??= initial;
    _formControl.current.data = { ...data };
    for (const [prop, items] of Object.entries(_inputs)) {
      let value = data[prop];
      if (value === undefined) {
        value = null;
      }
      if (!Array.isArray(items)) {
        items.setValue(value);
      }
      else {
        items.forEach(item => item.setValue(value));
      }
    }
  }

  function stripUnchanged(): [Partial<T>, number] {
    const newData: Record<string, unknown> = {};
    let nChanged = 0;
    for (const [prop, value] of Object.entries(formData)) {
      if (value != initial[prop]) {
        newData[prop] = value;
        nChanged++;
      }
    }
    return [newData as Partial<T>, nChanged];
  }

  return {
    formData,
    register,
    resetForm,
    stripUnchanged
  }
}