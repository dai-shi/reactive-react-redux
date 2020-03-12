import { Action as ReduxAction } from 'redux';
import { PatchedStore } from './patchStore';
/**
 * useSelector hook
 *
 * selector has to be stable. Either define it outside render
 * or use useCallback if selector uses props.
 *
 * @example
 * import { useCallback } from 'react';
 * import { useSelector } from 'reactive-react-redux';
 *
 * const Component = ({ count }) => {
 *   const isBigger = useSelector(store, useCallack(state => state.count > count, [count]));
 *   ...
 * };
 */
export declare const useSelector: <State, Action extends ReduxAction<any>, Selected>(patchedStore: PatchedStore<State, Action>, selector: (state: State) => Selected) => Selected;
