import * as React from 'react';
import {
  Action,
  AnyAction,
  Dispatch,
  Store,
} from 'redux';

type CustomContext = React.Context<unknown>;

export type createCustomContext = () => CustomContext;

export type ProviderProps<S, A extends Action> = {
  store: Store<S, A>;
  customContext?: CustomContext;
};

export type ProviderType<S = unknown, A extends Action = AnyAction>
  = React.ComponentType<ProviderProps<S, A>>;

export const Provider: ProviderType;

export const useDispatch: <A extends Action>() => Dispatch<A>;

type Opts = {
  customContext?: CustomContext;
};

export const useTrackedState: <S extends {}>(opts?: Opts) => S;

export const useTrackedSelectors: <S extends {}, M extends {}>(
  selectors: { [K in keyof M]: (state: S) => M[K] },
  opts?: Opts,
) => M;

export const useSelector: <S, V>(
  selector: (state: S) => V,
  equalityFn?: (a: V, b: V) => boolean | Opts & { equalityFn?: (a: V, b: V) => boolean },
  opts?: Opts,
) => V;
