/* eslint-disable @typescript-eslint/no-explicit-any */

type ConstructorReturnType<T extends new (...args: any) => any> = InstanceType<T>;
type ReqParam<K extends string> = { [P in K]: string };