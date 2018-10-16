import React from "react";
import { withRouter } from "react-router-dom";
import { auth } from "../../firebase/";
import { Dropdown } from "semantic-ui-react";

class SignOutButton extends React.Component {
  handleSignOut = () => {
    auth.doSignOut();
    this.props.history.push("/");
  };
  render() {
    return (
      <Dropdown.Item
        onClick={this.handleSignOut}
        icon="sign-out"
        text="Sign-out"
      />
    );
  }
}

export default withRouter(SignOutButton);
