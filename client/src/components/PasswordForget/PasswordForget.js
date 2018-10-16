import React, { Component } from "react";
import { Link } from "react-router-dom";

import { auth } from "../../firebase/";
import { Form, Message, Segment, Grid, Header } from "semantic-ui-react";

const PasswordForgetPage = () => (
  <Grid centered verticalAlign="middle">
    <Grid.Column className="form-column">
      <Header as="h2" className="text--center">
        Recover Password
      </Header>
      <PasswordForgetForm />
    </Grid.Column>
  </Grid>
);

const INITIAL_STATE = {
  email: "",
  error: null,
  isLoading: false,
  hasError: false
};

class PasswordForgetForm extends Component {
  state = { ...INITIAL_STATE, success: false };

  handleChangeText = event => {
    const newState = { ...this.state };
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  };

  onSubmit = event => {
    this.setState({ isLoading: true });
    const { email } = this.state;

    auth
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE, success: true });
      })
      .catch(error => {
        console.log(error);
        this.setState({ error, isLoading: false, hasError: true });
      });

    event.preventDefault();
  };

  render() {
    const { email, error, success, isLoading, hasError } = this.state;

    const isInvalid = email === "";

    return (
      <Form
        error={hasError}
        success={success}
        loading={isLoading}
        onSubmit={this.onSubmit}
      >
        <Segment>
          <Form.Input
            size="big"
            name="email"
            value={this.state.email}
            onChange={this.handleChangeText}
            type="email"
            label="Email address"
            placeholder="john@example.com"
          />
          <Message error header={error && error.message} />
          <Message
            success
            header="Email sent"
            content="Please check your email and follow the instructions to reset your password"
          />
          <Form.Button
            type="submit"
            size="big"
            fluid
            color="blue"
            disabled={isInvalid}
          >
            Reset My Password
          </Form.Button>
        </Segment>
      </Form>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={"/forget-password"}>Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

export { PasswordForgetForm, PasswordForgetLink };
