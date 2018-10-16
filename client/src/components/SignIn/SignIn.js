import React, { Component } from "react";

import { SignUpLink } from "../SignUp/SignUp";
import { auth } from "../../firebase/";
import { PasswordForgetLink } from "../PasswordForget/PasswordForget";
import { Form, Segment, Message, Grid, Header } from "semantic-ui-react";

const SignInPage = props => (
  <Grid centered verticalAlign="middle">
    <Grid.Column className="form-column">
      <Header as="h2" className="text--center">
        Log-in to your account
      </Header>
      <SignInForm history={props.history} />
      <Message>
        <PasswordForgetLink />
        <SignUpLink />
      </Message>
    </Grid.Column>
  </Grid>
);

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
  isLoading: false,
  hasError: false
};

class SignInForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  handleChangeText = event => {
    const newState = { ...this.state };
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  };

  onSubmit = event => {
    this.setState({ isLoading: true });
    event.preventDefault();
    const { email, password } = this.state;

    const { history } = this.props;

    auth
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        history.push("/actions");
      })
      .catch(error => {
        this.setState({ error, isLoading: false, hasError: true });
      });
  };

  render() {
    const { email, password, error, isLoading, hasError } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <Form error={hasError} loading={isLoading} onSubmit={this.onSubmit}>
        <Segment>
          <Form.Input
            icon="user"
            iconPosition="left"
            name="email"
            size="big"
            value={email}
            onChange={this.handleChangeText}
            type="email"
            label="Email address"
            placeholder="john@example.com"
          />
          <Form.Input
            icon="key"
            iconPosition="left"
            className="m-b-1"
            size="big"
            name="password"
            value={password}
            onChange={this.handleChangeText}
            type="password"
            label="Password"
            placeholder="Type your password"
          />
          <Message error header={error && error.message} />
          <Form.Button
            type="submit"
            color="blue"
            size="big"
            fluid
            disabled={isInvalid}
          >
            Login
          </Form.Button>
        </Segment>
      </Form>
    );
  }
}

export default SignInPage;

export { SignInForm };
