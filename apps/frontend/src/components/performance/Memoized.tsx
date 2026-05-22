import React, { memo, useMemo } from 'react';

/**
 * Higher-order component to memoize components with custom comparison
 */
export function memoize<P extends object>(
  Component: React.ComponentType<P>,
  arePropsEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, arePropsEqual);
}

/**
 * Memoized component wrapper with deep comparison for complex props
 */
export function MemoizedComponent<P extends object>(
  Component: React.ComponentType<P>,
  propKeys: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    return propKeys.every(key => {
      const prevValue = prevProps[key];
      const nextValue = nextProps[key];

      if (typeof prevValue === 'object' && prevValue !== null) {
        return JSON.stringify(prevValue) === JSON.stringify(nextValue);
      }

      return prevValue === nextValue;
    });
  });
}

/**
 * Use memo with dependency array for expensive calculations
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Component that only re-renders when specific props change
 */
export function SelectiveRender<P extends object>(
  Component: React.ComponentType<P>,
  watchedProps: (keyof P)[]
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, (prevProps, nextProps) => {
    return watchedProps.every(key => prevProps[key] === nextProps[key]);
  });
}
