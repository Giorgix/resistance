import React, { Component } from "react";
import { Link } from "react-router-dom";
import { firebase } from "../../firebase/";
import ActionList from "./ActionsList";
import ActionForm from "./ActionForm";
import { fetchApiAuth, fetchApi } from "../../apiCalls";
import AuthUserContext from "../App/AuthUserContext";
// Actions mock data
// import actionsTest from "../../data";
import { Button, Icon, Header, Message } from "semantic-ui-react";

import "./Actions.css";

class Actions extends Component {
  state = {
    data: [],
    error: null,
    title: "",
    text: "",
    image: "",
    uid: "",
    dialogOpen: false,
    editingAction: false
  };
  pollInterval = null;

  componentDidMount() {
    //1. Retrieve actions
    this.loadActionsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadActionsFromServer, 2000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  loadActionsFromServer = () => {
    // fetchApi wraps fecth to add required headers from JSON API spec
    // to every request and returns the default fecth promise
    fetchApi("/api/v1/actions")
      .then(res => res.json())
      .then(res => {
        if (!res.data) this.setState({ error: res.errors[0] });
        else this.setState({ data: res.data, error: null });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error getting actions", detail: error.message }
        });
      });
  };

  onChangeText = e => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  };

  onUpdateAction = id => {
    const currentAction = this.state.data.find(action => action.id === id);
    if (!currentAction) return;
    this.setState({
      dialogOpen: true,
      title: currentAction.attributes.title,
      text: currentAction.attributes.text,
      image: currentAction.attributes.image,
      updateId: id,
      editingAction: true
    });
  };

  onAccessSecret = () => {
    const currentUser = firebase.auth.currentUser;
    if (currentUser) {
      currentUser
        .getIdToken(/* forceRefresh */ true)
        .then(function(idToken) {
          const token = idToken;
          console.log(token);
          fetch(`api/v1/secret`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + idToken
              //'Host': 'api.producthunt.com'
            }
          })
            .then(res => res.json())
            .then(res => {
              console.log(res);
            });
          // Send token to your backend via HTTPS
          // ...
        })
        .catch(function(error) {
          // Handle error
        });
    } else {
      console.log("NOT LOGGED IN");
    }
  };

  submitAction = e => {
    e.preventDefault();
    const { title, text, image, updateId } = this.state;
    if (!title || !text || !image) return;
    if (updateId) {
      this.submitUpdatedAction();
    } else {
      this.submitNewAction();
    }
  };

  submitNewAction = () => {
    const { title, text, image } = this.state;
    const payload = {
      data: {
        type: "actions",
        attributes: { title, text, image }
      }
    };
    fetchApiAuth("/api/v1/actions", "POST", {}, payload)
      .then(res => res.json())
      .then(res => {
        if (!res.data) {
          this.setState({ error: res.errors[0] });
        } else {
          const data = [...this.state.data, res.data];
          this.setState({
            title: "",
            text: "",
            image: "",
            error: null,
            dialogOpen: false,
            data
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error creating action", detail: error.message }
        });
      });
  };

  submitUpdatedAction = () => {
    const { title, text, image, updateId } = this.state;
    const payload = {
      data: {
        type: "actions",
        attributes: { title, text, image }
      }
    };
    fetchApiAuth(`/api/v1/actions/${updateId}`, "PATCH", {}, payload)
      .then(res => res.json())
      .then(res => {
        if (!res.data) this.setState({ error: res.errors[0] });
        else
          this.setState({
            title: "",
            text: "",
            image: "",
            updateId: null,
            dialogOpen: false,
            editingAction: false
          });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error editing action", detail: error.message }
        });
      });
  };

  handleDialogOpen = () => {
    this.setState({
      dialogOpen: true,
      title: "",
      text: "",
      image: "",
      updateId: null
    });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false, editingAction: false });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.error && (
          <Message
            visible
            error
            header={this.state.error.title}
            content={this.state.error.detail}
          />
        )}
        <div className="text--center m-b-2">
          <Header as="h2">Actions</Header>
          <AuthUserContext.Consumer>
            {authUser =>
              authUser ? (
                <React.Fragment>
                  <Button onClick={this.onAccessSecret}>Secret</Button>
                  <Button
                    size="large"
                    onClick={this.handleDialogOpen}
                    color="blue"
                  >
                    <Icon name="add circle" /> New action
                  </Button>
                </React.Fragment>
              ) : (
                <p>
                  <Link to="/signin">Log-in </Link> to create an action
                </p>
              )
            }
          </AuthUserContext.Consumer>
        </div>
        <ActionList
          actions={this.state.data}
          handleUpdateAction={this.onUpdateAction}
        />
        <ActionForm
          title={this.state.title}
          text={this.state.text}
          image={this.state.image}
          dialogOpen={this.state.dialogOpen}
          handleChangeText={this.onChangeText}
          submitAction={this.submitAction}
          handleDialogClose={this.handleDialogClose}
          editingAction={this.state.editingAction}
        />
      </React.Fragment>
    );
  }
}

export default Actions;
