import Action from "./models/Action";
import * as admin from "firebase-admin";

const createDataSimple = (items, type) => {
  let payload;
  if (items.length > 0) {
    payload = items.map(item => {
      const newData = {};
      newData.type = type;
      newData.id = item._id || item;
      return newData;
    });
  } else {
    payload = [];
  }
  return payload;
};

// We Create a payload creator function to return the same response structure
const createActionPayload = action => {
  const commentsPayload = createDataSimple(action.comments, "comments");
  const likesData = createDataSimple(action.likedBy, "people");

  const payload = {
    id: action._id,
    type: "actions",
    attributes: {
      title: action.title,
      text: action.text,
      image: action.image,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
      likes: {
        count: action.likedBy.length || 0
      },
      comments: {
        count: action.comments.length
      }
    },
    relationships: {
      user: {
        links: {
          self: `${process.env.API_URL}/actions/${
            action._id
          }/relationships/user`,
          related: `${process.env.API_URL}/actions/${action._id}/user`
        },
        data: { type: "people", id: action.owner }
      },
      comments: {
        links: {
          self: `${process.env.API_URL}/actions/${
            action._id
          }/relationships/comments`,
          related: `${process.env.API_URL}/actions/${action._id}/comments`
        },
        data: commentsPayload
      },
      likes: {
        links: {
          self: `${process.env.API_URL}/actions/${
            action._id
          }/relationships/likes`,
          related: `${process.env.API_URL}/actions/${action._id}/likes`
        },
        data: likesData
      }
    }
  };
  return payload;
};

const getUsers = userIds => {
  const promises = userIds.map(async id => {
    const userRecord = await admin.auth().getUser(id);
    return {
      id,
      username: userRecord ? userRecord.displayName : "",
      photoURL: userRecord ? userRecord.photoURL : ""
    };
  });

  return Promise.all(promises);
};

const createActionIncludePayload = async (action, showComments = true) => {
  const userRecord = await admin.auth().getUser(action.owner);
  let commentsData = null;
  if (showComments) {
    const userIds = action.comments.map(comment => {
      return comment.userId;
    });
    const usersInfo = await getUsers(userIds);
    commentsData = action.comments.map((comment, index) => {
      const newCommentData = {};
      newCommentData.type = "comments";
      newCommentData.id = comment._id;
      newCommentData.attributes = {
        body: comment.body,
        from: usersInfo[index],
        createdAt: comment.date
      };

      return newCommentData;
    });
  }

  return [
    {
      type: "people",
      id: action.owner,
      attributes: {
        username: userRecord.toJSON().displayName,
        photoURL: userRecord.toJSON().photoURL
      }
    },
    ...commentsData
  ];
};

// GET /actions
export const getAll = (req, res) => {
  Action.find((err, actions) => {
    if (err) {
      const errObject = {
        status: "500",
        code: "A_G_500",
        title: "Internal server error",
        detail: err
      };
      return res.status(500).json({ errors: [errObject] });
    }
    const actionsPayload = actions.map(action => createActionPayload(action));
    const response = {
      links: {
        self: `${process.env.API_URL}/actions`
      },
      data: actionsPayload
    };

    return res.status(200).json(response);
  });
};

// GET /actions/:actionId
export const getById = (req, res) => {
  const { actionId } = req.params;
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_GID_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }
      // Otherwise we return the payload
      // TODO implement inclusion of related resource according to
      // http://jsonapi.org/format/#fetching-includes
      let includePayload;
      const actionPayload = createActionPayload(action);
      if (req.query.include && req.query.include === "all") {
        createActionIncludePayload(action).then(includePayload => {
          return res.status(200).json({
            links: {
              self: `${process.env.API_URL}/actions/${action._id}`
            },
            data: actionPayload,
            included: includePayload
          });
        });
      } else {
        return res.status(200).json({
          links: {
            self: `${process.env.API_URL}/actions/${action._id}`
          },
          data: actionPayload,
          included: includePayload
        });
      }
    })
    .catch(error => {
      const errObject = {
        status: "422",
        code: "A_GID_422",
        title: "Action id not valid",
        detail: error.message
      };

      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// GET /actions/:actionId/relationships/user
export const getByIdUserRel = (req, res) => {
  const { actionId } = req.params;
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_GID_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }
      // Otherwise we return the payload
      return res.status(200).json({
        links: {
          self: `${process.env.API_URL}/actions/${
            action._id
          }/relationships/user`,
          related: `${process.env.API_URL}/actions/${action._id}/user`
        },
        data: {
          type: "people",
          id: action.owner
        }
      });
    })
    .catch(error => {
      const errObject = {
        status: "422",
        code: "A_GID_422",
        title: "Action id not valid",
        detail: error.message
      };

      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// GET /actions/:actionId/relationships/comments
export const getByIdCommentsRel = (req, res) => {
  const { actionId } = req.params;
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_GID_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }
      let commentsPayload;
      if (action.comments.length > 0) {
        commentsPayload = action.comments.map(comment => {
          const newCommentData = {};
          newCommentData.type = "comments";
          newCommentData.id = comment._id;
          return newCommentData;
        });
      } else {
        commentsPayload = [];
      }
      // Otherwise we return the payload
      return res.status(200).json({
        links: {
          self: `${process.env.API_URL}/actions/${
            action._id
          }/relationships/comments`,
          related: `${process.env.API_URL}/actions/${action._id}/comments`
        },
        data: commentsPayload
      });
    })
    .catch(error => {
      const errObject = {
        status: "422",
        code: "A_GID_422",
        title: "Action id not valid",
        detail: error.message
      };

      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// GET /actions/:actionId/comments
export const getByIdComments = (req, res) => {
  const { actionId } = req.params;
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_GIDC_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }
      let commentsPayload;
      if (action.comments.length > 0) {
        commentsPayload = action.comments.map(comment => {
          const newCommentData = {};
          newCommentData.type = "comments";
          newCommentData.id = comment._id;
          newCommentData.attributes = {
            body: comment.body,
            date: comment.date,
            from: {
              id: comment.userId
            }
          };
          return newCommentData;
        });
      } else {
        commentsPayload = [];
      }
      // Otherwise we return the payload
      return res.status(200).json({
        links: {
          self: `${process.env.API_URL}/actions/${action._id}/comments`
        },
        data: commentsPayload
      });
    })
    .catch(error => {
      const errObject = {
        status: "422",
        code: "A_GIDC_422",
        title: "Action id not valid",
        detail: error.message
      };

      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// GET /actions/:actionId/user
export const getByIdUser = (req, res) => {
  const { actionId } = req.params;
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_GIDU_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }

      // Otherwise we return the payload
      admin
        .auth()
        .getUser(action.owner)
        .then(function(userRecord) {
          const userPayload = {
            type: "people",
            id: action.owner,
            attributes: {
              // TODO Fetch user data
              username: userRecord.toJSON().displayName || "Anonimous",
              photoURL: userRecord.toJSON().photoURL
            },
            links: {
              self: `${process.env.API_URL}/user/${action.owner}`
            },
            relationships: {
              comments: {
                links: {
                  related: `${process.env.API_URL}/user/${
                    action.owner
                  }/comments`
                }
                // TODO return coments basic Payload
                // data: commentsPayload
              },
              actions: {
                links: {
                  related: `${process.env.API_URL}/user/${action.owner}/actions`
                }
                // TODO return actions basic Payload
                //data: actionsPayload
              }
            }
          };
          return res.status(200).json({
            links: {
              self: `${process.env.API_URL}/actions/${action._id}/user`
            },
            data: userPayload
          });
        });
    })
    .catch(error => {
      console.log(error);
      const errObject = {
        status: "422",
        code: "A_GIDU_422",
        title: "Action id not valid",
        detail: error.message
      };
      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// POST /actions
export const post = (req, res) => {
  const action = new Action();
  // body parser lets us use the req.body
  if (!req.body.data || !req.body.data.attributes) {
    const errObject = {
      status: "400",
      code: "A_P_400",
      title: "Invalid body content",
      detail:
        "The request MUST include a single resource object as primary data"
    };

    return res.status(400).json({
      errors: [errObject]
    });
  }
  const { title, text, image } = req.body.data.attributes;
  if (!title || !text || !image) {
    // we should throw an error. we can do this check on the front end
    const errObject = {
      status: "400",
      code: "A_P_400",
      title: "Invalid body content",
      detail: "You must provide title, text and image"
    };

    return res.status(400).json({
      errors: [errObject]
    });
  }
  action.title = title;
  action.text = text;
  action.image = image;
  action.owner = req.user;
  action
    .save()
    .then(action => {
      const actionPayload = createActionPayload(action);
      return res.status(201).json({
        links: {
          self: `${process.env.API_URL}/actions/${action._id}`
        },
        data: actionPayload
      });
    })
    .catch(error => {
      const errObject = {
        status: "500",
        code: "A_PO_500",
        title: "Internal error",
        detail:
          error.message || "Some error occurred while creating the Action."
      };

      return res.status(500).json({
        errors: [errObject]
      });
    });
};

// PUT /actions/:actionId
export const update = (req, res) => {
  const { actionId } = req.params;
  const wantsIncludedPayload = req.query.include && req.query.include === "all";
  Action.findById(actionId)
    .then(action => {
      // We check if the action found is null
      // and return a not found status 404 with the error
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_PA_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }

      // We check if the user is the owner and there are attributes
      // so we perform the regular update
      if (req.body.data.attributes && action.owner === req.user) {
        const { title, text, image } = req.body.data.attributes;
        if (title) action.title = title;
        if (text) action.text = text;
        if (image) action.image = image;

        // Otherwise if its or not the owner but it has relationships we update those
      } else if (req.body.data.relationships) {
        // We handle if the payload contains likes
        if (req.body.data.relationships.likes) {
          // We check if there is no data under likes and return
          // a 400 (Bad Request) error
          if (
            !req.body.data.relationships.likes.data ||
            !req.body.data.relationships.likes.data[0].id ||
            req.body.data.relationships.likes.data[0].id !== req.user
          ) {
            const errObject = {
              status: "400",
              code: "A_PA_REL_400",
              title: "Bad Request",
              detail: "Missing information to process the request"
            };

            return res.status(400).json({
              errors: [errObject]
            });
          }
          const likedBy = req.user;

          // Check if the user already liked this action
          if (likedBy && !action.likedBy.includes(likedBy)) {
            action.likedBy.push(likedBy);

            // If the user already liked the action, unlike it
          } else {
            const index = action.likedBy.indexOf(likedBy);
            if (index > -1) {
              action.likedBy.splice(index, 1);
            }
          }
        }

        // Now we handle if the payload contains comments
        if (req.body.data.relationships.comments) {
          if (
            !req.body.data.relationships.comments.data ||
            !req.body.data.relationships.comments.data[0].attributes ||
            !req.body.data.relationships.comments.data[0].attributes.body ||
            req.body.data.relationships.comments.data[0].attributes.userId !==
              req.user
          ) {
            const errObject = {
              status: "400",
              code: "A_PA_REL_400",
              title: "Bad Request",
              detail: "Missing information to process the request"
            };

            return res.status(400).json({
              errors: [errObject]
            });
          }

          const commentData =
            req.body.data.relationships.comments.data[0].attributes;
          if (!commentData.date) commentData.date = Date.now();
          action.comments.push(commentData);
        }

        // Othwerise it can not be the owner and it's trying to update
        // attributes so we return a 403
      } else {
        const errObject = {
          status: "403",
          code: "A_PA_403",
          title: "Forbidden",
          detail: "You do not have privileges to perform this action"
        };

        return res.status(403).json({
          errors: [errObject]
        });
      }

      action
        .save()
        .then(action => {
          // If no error ocurred We return the success bool set to true
          const actionPayload = createActionPayload(action);

          if (wantsIncludedPayload) {
            createActionIncludePayload(action).then(includePayload => {
              return res.status(200).json({
                links: {
                  self: `${process.env.API_URL}/actions/${action._id}`
                },
                data: actionPayload,
                included: includePayload
              });
            });
          } else {
            return res.status(200).json({
              links: {
                self: `${process.env.API_URL}/actions/${action._id}`
              },
              data: actionPayload
            });
          }
        })
        .catch(error => {
          // If there is an error saving we return a Internal Server Error 500 and the error
          const errObject = {
            status: "500",
            code: "A_PA_500",
            title: "Internal error",
            detail:
              error.message || "Some error occurred while updating the Action."
          };

          return res.status(500).json({
            errors: [errObject]
          });
        });
    })
    .catch(error => {
      // We check if there is an error thrown by findById usually "Cast to ObjectId failed"
      // and return the pertinent 422 status code and error
      console.log(error);
      const errObject = {
        status: "422",
        code: "A_GID_422",
        title: "Action id not valid",
        detail: error.message
      };

      return res.status(422).json({
        errors: [errObject]
      });
    });
};

// DELETE /actions/:actionId
export const remove = (req, res) => {
  const { actionId } = req.params;

  // 1. We search for the action
  Action.findById(actionId)
    .then(action => {
      // 2. If no action found return proper error payload and status code
      if (!action) {
        const errObject = {
          status: "404",
          code: "A_DE_404",
          title: "Action not found",
          detail: "We couldn't find an action with that id"
        };

        return res.status(404).json({
          errors: [errObject]
        });
      }

      // 3. If the action owner id doesn't match the id from the tokenVerification
      // response attached to the request object return Forbidden error
      if (action.owner !== req.user) {
        const errObject = {
          status: "403",
          code: "A_DE_403",
          title: "Forbidden",
          detail: "You do not have privileges to perform this action"
        };

        return res.status(403).json({
          errors: [errObject]
        });
      }

      // 4. Otherwise the Auth user match the Action owner so we proceed with
      // the deletion of the resource.
      action
        .remove()
        .then(response => {
          return res.status(204).json();
        })
        .catch(error => {
          const errObject = {
            status: "500",
            code: "A_DE_500",
            title: "Internal error",
            detail:
              error.message || "Some error occurred while deleting the Action."
          };

          return res.status(500).json({
            errors: [errObject]
          });
        });
    })
    .catch(error => {
      const errObject = {
        status: "500",
        code: "A_DE_500",
        title: "Internal error",
        detail: error.message || "Some error occurred while finding the Action."
      };

      return res.status(500).json({
        errors: [errObject]
      });
    });
};
