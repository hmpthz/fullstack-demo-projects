import { useEffect } from "react";

interface SidebarMenuProps extends ChildrenProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export function SidebarMenu({ isOpen, closeMenu, children }: SidebarMenuProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.side-bar')) {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  // Must have a side-bar class
  return (
    <nav
      className={`block sm:hidden side-bar fixed top-0 right-0 min-w-[50%] h-full px-6 pt-12 bg-slate-100 shadow-lg z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <ul className="flex flex-col gap-4 items-start">
        {children}
      </ul>
    </nav>
  );
}
