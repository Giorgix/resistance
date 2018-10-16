import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { fetchApi } from "../../apiCalls";
import AuthUserContext from "../App/AuthUserContext";
import { Link } from "react-router-dom";

import {
  Card,
  Icon,
  Image,
  Button,
  Grid,
  Label,
  Segment,
  Message,
  Header
} from "semantic-ui-react";

import "./Action.css";

class Action extends React.Component {
  state = {
    userRecord: {
      username: "Anonymous",
      photoURL:
        "http://api.adorable.io/avatars/face/eyes9/nose3/mouth3/DEADBF/300"
    }
  };

  componentDidMount() {
    // We fetch the complete user info related to this action
    fetchApi(`/api/v1/actions/${this.props.id}/user`, "GET")
      .then(res => res.json())
      .then(res => {
        if (res.errors) this.setState({ error: res.errors[0] });
        else this.setState({ userRecord: res.data.attributes });
      });
  }

  render() {
    const { attributes, id, children, uid } = this.props;
    return (
      <Segment className="content-preview">
        <Link
          key={id}
          to={{
            pathname: `/actions/${id}`,
            // this is the trick!
            state: { modal: true }
          }}
        >
          <Grid stackable reversed="mobile">
            <Grid.Column width={12}>
              <Header as="h2">{attributes.title}</Header>
              <p>{children}</p>
            </Grid.Column>
            <Grid.Column width={4}>
              <div className="image-square">
                <Image src={attributes.image} />
              </div>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Column width={8}>
              <React.Fragment>
                <Label>
                  <Icon name="heart" /> {attributes.likes.count}
                </Label>
                <Label>
                  <Icon name="chat" /> {attributes.comments.count}
                </Label>
              </React.Fragment>
            </Grid.Column>
            <Grid.Column width={8}>
              <p className="text-right">
                <Image src={this.state.userRecord.photoURL} avatar />
                <span>
                  <strong>{this.state.userRecord.username}</strong>
                </span>
              </p>
            </Grid.Column>
          </Grid>
        </Link>
        <AuthUserContext.Consumer>
          {authUser =>
            authUser &&
            authUser.uid === uid && (
              <Message success>
                <Icon name="eye" />
                Your action
              </Message>
            )
          }
        </AuthUserContext.Consumer>
      </Segment>
    );
  }
}

Action.propTypes = {
  attributes: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    image: PropTypes.string,
    updatedAt: PropTypes.string
  }),
  id: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired
};

export default Action;
