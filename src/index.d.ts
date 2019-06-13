import * as React from 'react';
import {
  Action,
  AnyAction,
  Dispatch,
  Store,
} from 'redux';

type CustomContext = React.Context<unknown>;

export type createCustomContext = () => CustomContext;

export type ReduxProviderProps<S, A extends Action> = {
  store: Store<S, A>;
  customContext?: CustomContext;
};

export type ReduxProviderType<S = unknown, A extends Action = AnyAction>
  = React.ComponentType<ReduxProviderProps<S, A>>;

export const ReduxProvider: ReduxProviderType;

export const useReduxDispatch: <A extends Action>() => Dispatch<A>;

type Opts = {
  customContext?: CustomContext;
};

export const useReduxState: <S extends {}>(opts: Opts) => S;

export const useReduxSelectors: <S extends {}, M extends {}>(
  selectors: { [K in keyof M]: (state: S) => M[K] },
  opts: Opts,
) => M;

export const useReduxStateSimple: <S extends {}>(opts: Opts) => S;
export const useReduxStateRich: <S extends {}>(opts: Opts) => S;
