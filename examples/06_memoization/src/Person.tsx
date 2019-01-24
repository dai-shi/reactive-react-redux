import * as React from 'react';

import { useReduxDispatch, useReduxState } from 'react-hooks-easy-redux';

import { Action, State } from './state';

const { useMemo } = React;

const TextBox: React.SFC<{ text: string }> = ({ text }) => {
  // eslint-disable-next-line no-console
  console.log('rendering text:', text);
  return <span>{text}</span>;
};

const Person = () => {
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  const { age, firstName, lastName } = useMemo(
    () => ({
      age: state.person.age,
      firstName: state.person.name.firstName,
      lastName: state.person.name.lastName,
    }),
    [state.person],
  );
  return (
    <div>
      <div>
        First Name:
        <TextBox text={firstName} />
        <input
          value={firstName}
          onChange={(event) => {
            const newFirstName = event.target.value;
            dispatch({ firstName: newFirstName, type: 'setFirstName' });
          }}
        />
      </div>
      <div>
        Last Name:
        <TextBox text={lastName} />
        <input
          value={lastName}
          onChange={(event) => {
            const newLastName = event.target.value;
            dispatch({ lastName: newLastName, type: 'setLastName' });
          }}
        />
      </div>
      <div>
        Age:
        <input
          value={age}
          onChange={(event) => {
            const newAge = Number(event.target.value) || 0;
            dispatch({ age: newAge, type: 'setAge' });
          }}
        />
      </div>
    </div>
  );
};

export default Person;
