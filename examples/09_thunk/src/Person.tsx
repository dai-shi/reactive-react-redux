import React from 'react';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { useDispatch, useTrackedState } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter: React.FC<{ firstName: string }> = ({ firstName }) => {
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  return (
    <div>
      {Math.random()}
      {firstName}
      <div>
        <span>Count: {state.count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const Person = () => {
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  const setRandomFirstName = () => {
    const dispatchForThunk = dispatch as ThunkDispatch<State, unknown, Action>;
    dispatchForThunk(async (d: Dispatch<Action>) => {
      d({ firstName: 'Loading...', type: 'setFirstName' });
      try {
        const id = Math.floor(100 * Math.random());
        const url = `https://jsonplaceholder.typicode.com/posts/${id}`;
        const response = await fetch(url);
        const body = await response.json();
        d({ firstName: body.title.split(' ')[0], type: 'setFirstName' });
      } catch (e) {
        d({ firstName: 'ERROR: fetching', type: 'setFirstName' });
      }
    });
  };
  return (
    <div>
      {Math.random()}
      <Counter firstName={state.person.firstName} />
      <button type="button" onClick={setRandomFirstName}>Random First Name</button>
      <div>
        First Name:
        <input
          value={state.person.firstName}
          onChange={(event) => {
            const firstName = event.target.value;
            dispatch({ firstName, type: 'setFirstName' });
          }}
        />
      </div>
      <div>
        Last Name:
        <input
          value={state.person.lastName}
          onChange={(event) => {
            const lastName = event.target.value;
            dispatch({ lastName, type: 'setLastName' });
          }}
        />
      </div>
      <div>
        Age:
        <input
          value={state.person.age}
          onChange={(event) => {
            const age = Number(event.target.value) || 0;
            dispatch({ age, type: 'setAge' });
          }}
        />
      </div>
    </div>
  );
};

export default Person;
