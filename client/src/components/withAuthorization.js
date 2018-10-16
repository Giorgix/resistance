import React from "react";
import { withRouter } from "react-router-dom";
import AuthUserContext from "./App/AuthUserContext";
import { firebase } from "../firebase/";

// HOC to handle redirection and conditional rendering depending on the authUser and condition
const withAuthorization = authCondition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        // If the auth condition is not met we redirect to the signin page
        if (!authCondition(authUser)) {
          this.props.history.push("/signin");
        }
      });
    }
    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => (authUser ? <Component {...this.props} /> : null)}
        </AuthUserContext.Consumer>
      );
    }
  }
  return withRouter(WithAuthorization);
};

export default withAuthorization;
