import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Container } from "semantic-ui-react";
import Home from "../Home/Home";
import Actions from "../Actions/Actions";
import ActionView, { ModalView } from "../Actions/ActionView";
import NotFound from "../NotFound";
import NavBar from "../NavBar/NavBar";
import SignUp from "../SignUp/SignUp";
import SignIn from "../SignIn/SignIn";
import PasswordForget from "../PasswordForget/PasswordForget";
import Account from "../Account/Account";

import withAuthentication from "./withAuthentication";

class ModalSwitch extends React.Component {
  // We can pass a location to <Switch/> that will tell it to
  // ignore the router's current location and use the location
  // prop instead.
  //
  // We can also use "location state" to tell the app the user
  // wants to go to `/img/2` in a modal, rather than as the
  // main page, keeping the gallery visible behind it.
  //
  // Normally, `/img/2` wouldn't match the gallery at `/`.
  // So, to get both screens to render, we can save the old
  // location and pass it to Switch, so it will think the location
  // is still `/` even though its `/img/2`.
  previousLocation = this.props.location;

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render
    return (
      <React.Fragment>
        <Switch location={isModal ? this.previousLocation : location}>
          <Route exact path="/" component={Home} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/signin" component={SignIn} />
          <Route exact path="/forget-password" component={PasswordForget} />
          <Route exact path="/actions" component={Actions} />
          <Route path="/actions/:id" component={ActionView} />
          <Route exact path="/account" component={Account} />
          <Route exact component={NotFound} />
        </Switch>
        {isModal ? <Route path="/actions/:id" component={ModalView} /> : null}
      </React.Fragment>
    );
  }
}

const App = () => (
  <Router>
    <React.Fragment>
      <div className="App">
        <NavBar />
        <Container>
          <Route component={ModalSwitch} />
        </Container>
      </div>
    </React.Fragment>
  </Router>
);

export default withAuthentication(App);
