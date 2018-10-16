import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { Menu, Segment, Input, Header, Dropdown } from "semantic-ui-react";
import { Button, Container } from "semantic-ui-react";

import SignOutButton from "../SignOut/SignOut";
import AuthUserContext from "../App/AuthUserContext";

import "./NavBar.css";

const NavAuth = props => (
  <React.Fragment>
    <Menu.Item
      as={Link}
      to="/"
      name="home"
      active={props.activeItem === "homeNO"}
      onClick={props.handleItemClick}
    />
    <Menu.Item
      as={Link}
      to="/actions"
      name="actions"
      active={props.activeItem === "actionsNO"}
      onClick={props.handleItemClick}
    />
    <Menu.Menu position="right">
      <Menu.Item>
        <Input className="icon" icon="search" placeholder="Search..." />
      </Menu.Item>
      <Dropdown
        text=""
        icon="user circle"
        pointing
        className="nav-account-icon"
      >
        <Dropdown.Menu>
          <Dropdown.Header content={props.authUser.displayName} />
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/account" icon="user" text="Account" />
          <SignOutButton />
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  </React.Fragment>
);

const NavNoAuth = props => (
  <React.Fragment>
    <Menu.Item
      as={Link}
      to="/"
      name="home"
      active={props.activeItem === "homeNO"}
      onClick={props.handleItemClick}
    />
    <Menu.Item
      as={Link}
      to="/actions"
      name="actions"
      active={props.activeItem === "actionsNO"}
      onClick={props.handleItemClick}
    />
    <Menu.Menu position="right">
      <Menu.Item>
        <Button as={Link} to="/signup" primary>
          Sign up
        </Button>
      </Menu.Item>

      <Menu.Item>
        <Button as={Link} to="/signin">
          Log-in
        </Button>
      </Menu.Item>
    </Menu.Menu>
  </React.Fragment>
);

class NavBar extends React.Component {
  state = { activeItem: "home" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <Segment>
        <Container>
          <Menu secondary>
            <Menu.Item as={Link} to="/">
              <img src="/images/logo.svg" className="nav-logo" alt="logo" />
              <Header as="h2" className="nav-logo-text" color="blue">
                Resistance
              </Header>
            </Menu.Item>
            <AuthUserContext.Consumer>
              {authUser =>
                authUser ? (
                  <NavAuth
                    handleItemClick={this.handleItemClick}
                    authUser={authUser}
                    activeItem={activeItem}
                  />
                ) : (
                  <NavNoAuth
                    handleItemClick={this.handleItemClick}
                    activeItem={activeItem}
                  />
                )
              }
            </AuthUserContext.Consumer>
          </Menu>
        </Container>
      </Segment>
    );
  }
}

NavAuth.propTypes = {
  handleItemClick: PropTypes.func.isRequired,
  authUser: PropTypes.object,
  activeItem: PropTypes.string.isRequired
};

NavNoAuth.propTypes = {
  handleItemClick: PropTypes.func.isRequired,
  activeItem: PropTypes.string.isRequired
};

export default NavBar;
