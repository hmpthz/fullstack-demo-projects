import type React from "react";

interface ButtonProps extends React.ComponentProps<'button'> {
  small?: boolean;
  gray?: boolean;
}

export function Button({ small, gray, children, className, ...props }: ButtonProps) {
  const sizeTwd = small ? 'px-2 py-2 min-w-[64px]' : 'px-4 py-2 font-bold min-w-20';
  const colorTwd = gray
    ? 'bg-gray-400 hover:bg-gray-300 focus-visible:bg-gray-300'
    : 'bg-blue-500 hover:bg-blue-400 focus-visible:bg-blue-400';

  return (
    <button className={`rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 text-white ${sizeTwd} ${colorTwd} ${className}`} {...props} >
      {children}
    </button>
  )
}