import * as React from 'react';
import { useTrackedState } from 'reactive-react-redux';

import { useSetVisibilityFilter } from '../actions';
import { State, VisibilityFilterType } from '../types';

type Props = {
  filter: VisibilityFilterType;
};

const FilterLink: React.FC<Props> = ({ filter, children }) => {
  const state = useTrackedState<State>();
  const active = filter === state.visibilityFilter;
  const setVisibilityFilter = useSetVisibilityFilter();
  return (
    <button
      type="button"
      onClick={() => setVisibilityFilter(filter)}
      disabled={active}
      style={{
        marginLeft: '4px',
      }}
    >
      {children}
    </button>
  );
};

export default FilterLink;
