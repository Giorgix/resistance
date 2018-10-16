import React from "react";
import AuthUserContext from "./AuthUserContext";
import { firebase } from "../../firebase/";

// We create a higher order component to handle the App logic
const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    state = {
      authUser: null
    };

    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        authUser
          ? this.setState({ authUser })
          : this.setState({ authUser: null });
      });
    }

    render() {
      const { authUser } = this.state;

      // We use here the React’s context API, Context provides a way to pass
      // data through the component tree without having to pass
      // props down manually at every level..
      // https://reactjs.org/docs/context.html
      return (
        <AuthUserContext.Provider value={authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return WithAuthentication;
};

export default withAuthentication;
