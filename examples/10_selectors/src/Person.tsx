import * as React from 'react';
import { useState, useCallback } from 'react';

import { useDispatch, useTrackedSelectors } from 'reactive-react-redux';

import { Action, State } from './state';

type PersonNameType = {
  first: string;
  last: string;
};

const PersonName = () => {
  const [mode, setMode] = useState('first');
  const names = useTrackedSelectors<State, PersonNameType>({
    first: useCallback(state => state.person.firstName, []),
    last: useCallback(state => state.person.lastName, []),
  });
  const dispatch = useDispatch<Action>();
  return (
    <div>
      {Math.random()}
      {mode === 'first' && (
        <div>
          First Name:
          <input
            value={names.first}
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
            value={names.last}
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
  const { age } = useTrackedSelectors<State, { age: number }>({
    age: state => state.person.age,
  });
  const dispatch = useDispatch<Action>();
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
