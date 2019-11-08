import React from 'react';

import { useDispatch, useTrackedState } from 'reactive-react-redux';

import { Action, State } from './state';

const Person = () => {
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  return (
    <div>
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
