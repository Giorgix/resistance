import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { fetchApiAuth, fetchApi } from "../../apiCalls";
import AuthUserContext from "../App/AuthUserContext";

import {
  Dimmer,
  Loader,
  Image,
  Grid,
  Modal,
  Button,
  Divider,
  Form,
  Input,
  Header,
  Label,
  Message,
  Icon
} from "semantic-ui-react";
import "./ActionView.css";

const LikeButton = props => {
  const likesUids = props.likes.map(like => {
    return like.id;
  });
  const isLiked = likesUids.includes(props.authUser.uid);
  return (
    <Button
      color={isLiked ? "blue" : "grey"}
      icon
      onClick={() => props.handleLike(props.authUser.uid)}
    >
      <Icon name="heart" />
      Like
    </Button>
  );
};

const CommentsList = props => {
  const comments = props.included.slice(1);

  const commentItems = comments.map(comment => (
    <div className="comment" key={comment.id}>
      <p>
        <strong>{comment.attributes.from.username}</strong>{" "}
        {comment.attributes.body}{" "}
        <small>{moment(comment.attributes.createdAt).fromNow()}</small>
      </p>
    </div>
  ));
  return <div className="comments-list">{commentItems}</div>;
};

const OptionsAuth = props => {
  return (
    <React.Fragment>
      <div className="m-b-1">
        <Button as="div" labelPosition="right">
          <LikeButton
            authUser={props.authUser}
            handleLike={props.handleLike}
            likes={props.data.relationships.likes.data}
          />
          <Label as="a" basic pointing="left">
            {props.data.attributes.likes.count}
          </Label>
        </Button>
        <Button floated="right" as="div" labelPosition="left">
          <Label as="a" basic pointing="right">
            {props.data.attributes.comments.count}
          </Label>
          <Button icon onClick={props.focus}>
            <Icon name="chat" />
            Comments
          </Button>
        </Button>
      </div>

      <Form onSubmit={e => props.submitComment(e, props.authUser.uid)}>
        <Input
          ref={props.handleRef}
          fluid
          placeholder="Write a comment"
          name="comment"
          onChange={props.handleChangeText}
          required
          value={props.comment}
        />
      </Form>
    </React.Fragment>
  );
};

class Action extends React.Component {
  state = {
    data: {},
    included: [],
    comment: "",
    error: null
  };

  componentDidMount() {
    // We fecth the current action with the extra include query param
    // to get all the related data
    fetchApi(`/api/v1/actions/${this.props.match.params.id}?include=all`)
      .then(res => res.json())
      .then(res => {
        if (!res.data) this.setState({ error: res.errors[0] });
        else
          this.setState({
            data: res.data,
            included: res.included,
            error: null
          });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error getting action", detail: error.message }
        });
      });
  }

  submitComment = (event, uid) => {
    event.preventDefault();
    const { comment } = this.state;

    // We create the proper payload to update the comments relationship
    // following the JSON API spec
    const payload = {
      data: {
        type: "actions",
        id: this.state.data.id,
        relationships: {
          comments: {
            data: [
              {
                type: "comments",
                attributes: {
                  body: comment,
                  userId: uid,
                  date: Date.now()
                }
              }
            ]
          }
        }
      }
    };

    // We perform an authenticated PATH request since to like the user
    // must be authenticated
    fetchApiAuth(
      `/api/v1/actions/${this.state.data.id}?include=all`,
      "PATCH",
      {},
      payload
    )
      .then(res => res.json())
      .then(res => {
        if (!res.data) {
          this.setState({ error: res.errors[0] });
        } else {
          // If successfully we update the new like state
          // Since every click we want to like/unlike we update the current
          // state's data likes attribute with the one from the response
          this.setState({
            data: res.data,
            included: res.included,
            comment: ""
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error posting a comment", detail: error.message }
        });
      });
  };

  handleLike = uid => {
    const currentUid = uid;

    // We create the proper payload to update the likes relationship
    // following the JSON API spec
    const payload = {
      data: {
        type: "actions",
        id: this.state.data.id,
        relationships: {
          likes: {
            data: [
              {
                type: "people",
                id: currentUid
              }
            ]
          }
        }
      }
    };

    // We perform an authenticated PATH request since to like the user
    // must be authenticated
    fetchApiAuth(`/api/v1/actions/${this.state.data.id}`, "PATCH", {}, payload)
      .then(res => res.json())
      .then(res => {
        if (!res.data) {
          this.setState({ error: res.errors[0] });
        } else {
          // If successfully we update the new like state
          // Since every click we want to like/unlike we update the current
          // state's data likes attribute with the one from the response
          this.setState({ data: res.data });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          error: { title: "Error liking the action", detail: error.message }
        });
      });
  };

  handleChangeText = e => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  };

  handleDeleteAction = id => {
    fetchApiAuth(`/api/v1/actions/${id}`, "DELETE").then(res => {
      if (res.errors) this.setState({ error: res.errors[0] });
      else this.props.history.goBack();
    });
  };

  handleRef = c => {
    this.inputRef = c;
  };

  focus = () => {
    this.inputRef.focus();
  };

  render() {
    const { data, included, comment } = this.state;
    // 1. If there is no error or data show Loader
    if (!this.state.error && !data.attributes) {
      return (
        <Grid stackable reversed="mobile" className="action-view">
          <Dimmer active inverted>
            <Loader inverted content="Loading" />
          </Dimmer>
        </Grid>
      );
    }

    // 2. If there is an error show it
    if (this.state.error) {
      return (
        <Message
          visible
          error
          header={this.state.error.title}
          content={this.state.error.detail}
        />
      );
    }

    //3. Otherwise if there is data render the ActionView
    if (data.attributes) {
      return (
        <React.Fragment>
          <Header as="h1" textAlign="center" className="p-v-2">
            {data.attributes.title}
          </Header>

          <Grid stackable className="action-view">
            <Grid.Column width={9} className="action-view-image">
              <Image src={data.attributes.image} className="m-b-1" />
              <div className="m-b-1">
                {moment(data.attributes.createdAt).fromNow()} by &nbsp;
                <Image
                  src={
                    included[0].attributes.photoURL ||
                    "http://api.adorable.io/avatars/face/eyes9/nose3/mouth3/DEADBF/300"
                  }
                  avatar
                />
                <span>
                  <strong>
                    {included[0].attributes.username || "Anonymous"}
                  </strong>
                </span>
              </div>
              <p className="m-b-1">{data.attributes.text}</p>
            </Grid.Column>
            <Grid.Column width={7}>
              <CommentsList included={this.state.included} />
              <Divider />
              <AuthUserContext.Consumer>
                {authUser => {
                  if (
                    authUser &&
                    authUser.uid === data.relationships.user.data.id
                  ) {
                    return (
                      <React.Fragment>
                        <div className="m-b-1">
                          <OptionsAuth
                            authUser={authUser}
                            data={data}
                            comment={comment}
                            handleLike={this.handleLike}
                            focus={this.focus}
                            submitComment={this.submitComment}
                            handleRef={this.handleRef}
                            handleChangeText={this.handleChangeText}
                          />
                        </div>
                        <div className="">
                          <Button
                            onClick={() => {
                              this.handleUpdateAction(data.id);
                            }}
                          >
                            <Icon name="edit" /> Edit
                          </Button>
                          <Button
                            color="red"
                            onClick={() => {
                              this.handleDeleteAction(data.id);
                            }}
                          >
                            <Icon name="delete" /> DELETE
                          </Button>
                        </div>
                      </React.Fragment>
                    );
                  }
                  if (authUser) {
                    return (
                      <OptionsAuth
                        authUser={authUser}
                        data={data}
                        handleLike={this.handleLike}
                        focus={this.focus}
                        submitComment={this.submitComment}
                        handleRef={this.handleRef}
                        handleChangeText={this.handleChangeText}
                      />
                    );
                  } else {
                    return (
                      <React.Fragment>
                        <Label>
                          <Icon name="heart" /> {data.attributes.likes.count}
                        </Label>
                        <Label>
                          <Icon name="chat" /> {data.attributes.comments.count}
                        </Label>
                        <Divider />
                        <Link to="/signin">Log-in</Link> to like or comment
                      </React.Fragment>
                    );
                  }
                }}
              </AuthUserContext.Consumer>
            </Grid.Column>
          </Grid>
        </React.Fragment>
      );
    }
  }
}

export const ModalView = ({ match, history }) => {
  const image = "https://loremflickr.com/320/240?random=15";
  if (!image) {
    return null;
  }
  const back = e => {
    e.stopPropagation();
    history.goBack();
  };
  return (
    <Modal onClose={back} open={true} closeIcon>
      <Modal.Content>
        <Action match={match} history={history} />
      </Modal.Content>
    </Modal>
  );
};

class ActionView extends React.Component {
  render() {
    const image = "https://loremflickr.com/320/240?random=15";
    if (!image) {
      return <div>Image not found</div>;
    }
    return (
      <div>
        <Action {...this.props} />
      </div>
    );
  }
}

export default ActionView;
