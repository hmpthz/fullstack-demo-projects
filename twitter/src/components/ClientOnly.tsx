import React, { useEffect, useState } from 'react'

// Type for the HOC factory function
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = null
) {
  // Return a new component that takes the same props as the wrapped component
  function ClientOnly(props: P) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
      setIsMounted(true)
    }, [])

    if (!isMounted) {
      return fallback
    }

    return <Component {...props} />
  }

  // Display name for React DevTools
  ClientOnly.displayName = `${Component.displayName || Component.name || 'Component'} (ClientOnly)`;
  return ClientOnly;
}