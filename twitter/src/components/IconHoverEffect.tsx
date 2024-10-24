
interface IconHoverProps extends ChildrenProps {
  red?: boolean;
}

export function IconHoverEffect({ children, red }: IconHoverProps) {
  const redTwd = 'outline-red-400 group-hover:bg-red-200 group-focus-visible:bg-red-200';
  const grayTwd = 'outline-gray-400 group-hover:bg-gray-200 group-focus-visible:bg-gray-200';

  return (
    <div className={`rounded-full p-2 transition-colors duration-200 ${red ? redTwd : grayTwd }`}>
      {children}
    </div>
  )
}