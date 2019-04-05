import * as React from 'react';

import { useReduxDispatch, useReduxSelectors } from 'reactive-react-redux';

import { Action, State } from './state';

const { useState, useCallback } = React;

type PersonNameType = {
  first: { name: string };
  last: { name: string };
};

const PersonName = () => {
  const [mode, setMode] = useState('first');
  const { first, last } = useReduxSelectors<State, PersonNameType>({
    first: useCallback(state => ({ name: state.person.firstName }), []),
    last: useCallback(state => ({ name: state.person.lastName }), []),
  });
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      {Math.random()}
      {mode === 'first' && (
        <div>
          First Name:
          <input
            value={first.name}
            onChange={(event) => {
              const firstName = event.target.value;
              dispatch({ firstName, type: 'setFirstName' });
            }}
          />
          <button type="button" onClick={() => setMode('last')}>toggle</button>
        </div>
      )}
      {mode === 'last' && (
        <div>
          Last Name:
          <input
            value={last.name}
            onChange={(event) => {
              const lastName = event.target.value;
              dispatch({ lastName, type: 'setLastName' });
            }}
          />
          <button type="button" onClick={() => setMode('first')}>toggle</button>
        </div>
      )}
    </div>
  );
};

const PersonAge = () => {
  const { age } = useReduxSelectors<State, { age: number }>({
    age: state => state.person.age,
  });
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      {Math.random()}
      <div>
        Age:
        <input
          value={age}
          onChange={(event) => {
            const nextAge = Number(event.target.value) || 0;
            dispatch({ age: nextAge, type: 'setAge' });
          }}
        />
      </div>
    </div>
  );
};

const Person = () => (
  <div>
    <PersonName />
    <PersonAge />
  </div>
);

export default Person;
