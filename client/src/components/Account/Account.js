import React from "react";

import AuthUserContext from "../App/AuthUserContext";
import { PasswordForgetForm } from "../PasswordForget/PasswordForget";
import PasswordChangeForm from "../PasswordChange/PasswordChange";
import withAuthorization from "../withAuthorization";
import { Header, Grid, Image } from "semantic-ui-react";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser && (
        <Grid centered verticalAlign="middle">
          <Grid.Column className="form-column">
            <Image src={authUser.photoURL} size="small" circular centered />
            <Header as="h2" className="text--center">
              Your Account: {authUser.displayName}
            </Header>
            <hr />
            <Header as="h4">Reset your password</Header>
            <PasswordForgetForm />
            <Header as="h4">Change your password</Header>
            <PasswordChangeForm />
          </Grid.Column>
        </Grid>
      )
    }
  </AuthUserContext.Consumer>
);

const authCondition = authUser => authUser !== null;
// We could also have a condition checking the auth object roles/scope like this:
// !!authUser && authUser.role === 'ADMIN';
export default withAuthorization(authCondition)(AccountPage);
