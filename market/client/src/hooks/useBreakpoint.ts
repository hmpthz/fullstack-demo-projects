import { useEffect, useState } from 'react';
import { debounce } from '@shared/debounce';

const breakpoints = {
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536
};
type Breakpoints = null | keyof (typeof breakpoints);

export function useBreakpoint(debounceWait = 500) {
  const [breakpoint, setBreakpoint] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = document.documentElement.clientWidth;
      let bp = null;
      for (const [name, value] of Object.entries(breakpoints)) {
        if (width < value) {
          break;
        }
        bp = name;
      }
      setBreakpoint(bp);
    };
    const debouncedHandleResize = debounce(handleResize, debounceWait);

    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      return window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  return breakpoint as Breakpoints;
}