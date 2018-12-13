/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { configure, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

import {
  ReduxProvider,
  useReduxState,
  useReduxDispatch,
} from '../src/index';

configure({ adapter: new Adapter() });

describe('basic spec', () => {
  it('hacks are defiend', () => {
    expect(useReduxState).toBeDefined();
    expect(useReduxDispatch).toBeDefined();
  });

  it.skip('create a component', () => {
    const initialState = {
      counter1: 0,
    };
    const reducer = (state = initialState, action) => {
      if (action.type === 'increment') {
        return { ...state, counter1: state.counter1 + 1 };
      }
      return state;
    };
    const store = createStore(reducer);
    const Counter = () => {
      const value = useReduxState();
      const dispatch = useReduxDispatch();
      return (
        <div>
          <span>{value}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        </div>
      );
    };
    const App = () => (
      <ReduxProvider store={store}>
        <div>
          <div className="first">
            <Counter />
          </div>
          <div className="second">
            <Counter />
          </div>
        </div>
      </ReduxProvider>
    );
    const wrapper = mount(<App />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('.first button').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
