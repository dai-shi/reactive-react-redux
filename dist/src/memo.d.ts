/// <reference types="react" />
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
export declare const memo: (Component: import("react").ComponentType<any>, areEqual?: ((prevProps: Readonly<any>, nextProps: Readonly<any>) => boolean) | undefined) => import("react").MemoExoticComponent<(props: any) => import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>>;
