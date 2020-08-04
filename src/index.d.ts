import { Context, ComponentType } from 'react';
import { Store } from 'redux';

type BaseState = Record<string, unknown>;

export interface RootState extends BaseState {}

type CustomContext = Context<unknown>;

export function createCustomContext(): CustomContext;

export const Provider: ComponentType<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: Store<any, any>;
  customContext?: CustomContext;
}>;

type Opts = {
  customContext?: CustomContext;
};

export type Dispatch<Action> = <T extends Action>(action: T) => T;

export function useDispatch<Action>(opts?: Opts): Dispatch<Action>;

export function useTrackedState<
  State extends BaseState = RootState
>(opts?: Opts): State;

export function useSelector<
  State extends BaseState = RootState,
  Selected = unknown
>(
  selector: (state: State) => Selected,
  equalityFn?: (a: Selected, b: Selected) => boolean
    | Opts & { equalityFn?: (a: Selected, b: Selected) => boolean },
  opts?: Opts,
): Selected;

// deep proxy utils

/**
 * If `obj` is a proxy, it will return the original object.
 * Otherwise, it will return null.
 */
export function getUntrackedObject<T>(obj: T): T | null;

// special React.memo with tracking suppoort

export function memo<Props>(
  Component: React.FC<Props>,
  areEqual?: (prevProps: Props, nextProps: Props) => boolean,
): React.FC<Props>;
