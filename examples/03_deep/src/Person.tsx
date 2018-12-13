import * as React from 'react';

import { useReduxDispatch, useReduxState } from 'react-hooks-easy-redux';

import { Action, State } from './state';

const TextBox: React.SFC<{ text: string }> = ({ text }) => {
  // tslint:disable-next-line:no-console
  console.log('rendering text:', text);
  return <span>{text}</span>;
};

const PersonFirstName = () => {
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      First Name:
      <TextBox text={state.person.firstName} />
      <input
        value={state.person.firstName}
        onChange={(event) => {
          const firstName = event.target.value;
          dispatch({ firstName, type: 'setFirstName' });
        }}
      />
    </div>
  );
};

const PersonLastName = () => {
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      Last Name:
      <TextBox text={state.person.lastName} />
      <input
        value={state.person.lastName}
        onChange={(event) => {
          const lastName = event.target.value;
          dispatch({ lastName, type: 'setLastName' });
        }}
      />
    </div>
  );
};

const PersonAge = () => {
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  return (
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
  );
};

const Person = () => (
  <>
    <PersonFirstName />
    <PersonLastName />
    <PersonAge />
  </>
);

export default Person;
