import React, { Component } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/";
import { Form, Segment, Message, Grid, Header } from "semantic-ui-react";
import "./SignUp.css";

const SignInLink = () => (
  <p>
    Already have an account? <Link to={"/signin"}>Log-in</Link>
  </p>
);

const SignUpPage = props => (
  <Grid centered verticalAlign="middle">
    <Grid.Column className="form-column">
      <Header as="h2" className="text--center m-b-1">
        Sign Up
      </Header>
      <SignUpForm history={props.history} />
      <Message>
        <SignInLink />
      </Message>
    </Grid.Column>
  </Grid>
);

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  isLoading: false,
  hasError: false
};

class SignUpForm extends Component {
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
    const self = this;
    this.setState({ isLoading: true });
    event.preventDefault();
    const { username, email, passwordOne } = this.state;
    const { history } = this.props;

    // We create a new user using the enail and password provided
    auth
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // After the user has been succesfully creted we update the profile
        // with the username and random avatar url provided
        // TODO Create an easy way to create a random avatar url
        auth
          .doUpdateProfile(
            username,
            "http://api.adorable.io/avatars/face/eyes9/nose3/mouth3/DEADBF/300"
          )
          .then(function() {
            self.setState({ ...INITIAL_STATE });
            history.push("/actions");
          })
          .catch(function(error) {
            self.setState({ error, isLoading: false, hasError: true });
          });
      })
      .catch(error => {
        this.setState({ error, isLoading: false, hasError: true });
      });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
      isLoading,
      hasError
    } = this.state;
    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "";

    return (
      <Form loading={isLoading} onSubmit={this.onSubmit} error={hasError}>
        <Segment>
          <Form.Input
            name="username"
            value={this.state.username}
            onChange={this.handleChangeText}
            type="text"
            size="big"
            label="Choose a nickname"
            placeholder="johndoe34"
          />
          <Form.Input
            name="email"
            size="big"
            value={this.state.email}
            onChange={this.handleChangeText}
            type="email"
            label="Email address"
            placeholder="john@example.com"
          />
          <Form.Input
            className="m-b-1"
            size="big"
            name="passwordOne"
            value={passwordOne}
            onChange={this.handleChangeText}
            type="password"
            label="Password"
            placeholder="Type a password"
          />
          <Form.Input
            className="m-b-1"
            size="big"
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.handleChangeText}
            type="password"
            label="Confirm password"
            placeholder="Confirm password"
          />
          <Message error header={error && error.message} />
          <Form.Button
            type="submit"
            color="blue"
            size="big"
            fluid
            disabled={isInvalid}
          >
            Sign Up
          </Form.Button>
        </Segment>
      </Form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={"/signup"}>Sign Up</Link>
  </p>
);

export default SignUpPage;

export { SignUpForm, SignUpLink };
