import React, { Component } from "react";

import { auth } from "../../firebase/";
import { Form, Message, Segment } from "semantic-ui-react";

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: null,
  isLoading: false,
  hasError: false
};

class PasswordChangeForm extends Component {
  state = { ...INITIAL_STATE, success: false };

  handleChangeText = event => {
    const newState = { ...this.state };
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  };

  onSubmit = event => {
    this.setState({ isLoading: true });
    const { passwordOne } = this.state;

    auth
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE, success: true });
      })
      .catch(error => {
        this.setState({ error, isLoading: false, hasError: true });
      });

    event.preventDefault();
  };

  render() {
    const {
      passwordOne,
      passwordTwo,
      error,
      success,
      isLoading,
      hasError
    } = this.state;

    const isInvalid = passwordOne !== passwordTwo || passwordOne === "";

    return (
      <Form
        error={hasError}
        success={success}
        loading={isLoading}
        onSubmit={this.onSubmit}
      >
        <Segment>
          <Form.Input
            className="m-b-1"
            size="big"
            name="passwordOne"
            value={passwordOne}
            onChange={this.handleChangeText}
            type="password"
            label="New password"
            placeholder="Type new password"
          />
          <Form.Input
            className="m-b-1"
            size="big"
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.handleChangeText}
            type="password"
            label="Confirm New password"
            placeholder="Confirm new password"
          />
          <Message error header={error && error.message} />

          <Message success header="Password successfuly changed!" />
          <Form.Button
            type="submit"
            size="big"
            fluid
            color="blue"
            disabled={isInvalid}
          >
            Change Password
          </Form.Button>
        </Segment>
      </Form>
    );
  }
}

export default PasswordChangeForm;
