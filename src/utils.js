import { useReducer } from 'react';

import { proxyState } from 'proxyequal';

export const createTrapped = (state, cache) => {
  let trapped;
  if (cache && cache.trapped.has(state)) {
    trapped = cache.trapped.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, cache && cache.proxy);
    if (cache) cache.trapped.set(state, trapped);
  }
  return trapped;
};

// useForceUpdate hook
const forcedReducer = state => state + 1;
export const useForceUpdate = () => useReducer(forcedReducer, 0)[1];
