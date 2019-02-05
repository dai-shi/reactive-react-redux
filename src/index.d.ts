import * as React from 'react';
import {
  Action,
  AnyAction,
  Dispatch,
  Store,
} from 'redux';

export type ReduxProviderProps<S, A extends Action> = {
  store: Store<S, A>;
  children?: React.ReactNode;
};

export type ReduxProviderType<S = unknown, A extends Action = AnyAction>
  = React.ComponentType<ReduxProviderProps<S, A>>;

export const ReduxProvider: ReduxProviderType;

export const useReduxDispatch: <A extends Action>() => Dispatch<A>;

export const useReduxState: <S>() => S;

export const useReduxStateSimple: <S extends {}>() => S;
