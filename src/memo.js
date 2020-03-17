import { memo as reactMemo } from 'react';

import { trackMemo } from './deepProxy';

export const memo = (Component, areEqual) => {
  const WrappedComponent = (props) => {
    Object.values(props).forEach(trackMemo);
    return Component(props);
  };
  return reactMemo(WrappedComponent, areEqual);
};
