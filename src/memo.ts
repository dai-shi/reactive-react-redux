import { ComponentProps, createElement, memo as reactMemo } from 'react';
import { trackMemo } from 'proxy-compare';

/**
 * memo
 *
 * Using `React.memo` with tracked state is not compatible,
 * because `React.memo` stops state access, thus no tracking occurs.
 * This is a special memo to be used instead of `React.memo` with tracking support.
 *
 * @example
 * import { memo } from 'reactive-react-redux';
 *
 * const ChildComponent = memo(({ obj1, obj2 }) => {
 *   // ...
 * });
 */
export const memo = (
  Component: Parameters<typeof reactMemo>[0],
  areEqual?: Parameters<typeof reactMemo>[1],
) => {
  const WrappedComponent = (props: ComponentProps<typeof Component>) => {
    Object.values(props).forEach(trackMemo);
    return createElement(Component, props);
  };
  return reactMemo(WrappedComponent, areEqual);
};
