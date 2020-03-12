import React, { useMemo } from 'react';

import { useDispatch, useTrackedState } from './state';

const TextBox: React.SFC<{ text: string }> = ({ text }) => {
  // eslint-disable-next-line no-console
  console.log('rendering text:', text);
  return <span>{text}</span>;
};

const Person = () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
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
