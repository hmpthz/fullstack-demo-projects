/* eslint-disable @typescript-eslint/no-explicit-any */

type ConstructorReturnType<T extends new (...args: any) => any> = InstanceType<T>;
