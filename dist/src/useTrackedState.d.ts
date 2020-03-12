import { Action as ReduxAction } from 'redux';
import { PatchedStore } from './patchStore';
/**
 * useTrackedState hook
 *
 * It return the Redux state wrapped by Proxy,
 * and the state prperty access is tracked.
 * It will only re-render if accessed properties are changed.
 *
 * @example
 * import { useTrackedState } from 'reactive-react-redux';
 *
 * const Component = () => {
 *   const state = useTrackedState(store);
 *   ...
 * };
 */
export declare const useTrackedState: <State, Action extends ReduxAction<any>>(patchedStore: PatchedStore<State, Action>, opts?: any) => State;
