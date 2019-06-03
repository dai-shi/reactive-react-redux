import { Action, VisibilityFilterType } from '../types';

const visibilityFilter = (
  state: VisibilityFilterType = 'SHOW_ALL',
  action: Action,
): VisibilityFilterType => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

export default visibilityFilter;
