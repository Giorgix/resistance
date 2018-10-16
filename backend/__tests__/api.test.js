process.env.DB_URI = "mongodb://localhost:27017/resistance-test";
process.env.PORT = "5001";

import Action from "../models/Action";
import mongoose from "mongoose";

// We use our auth mock instead of the real auth middleware
//jest.mock("../auth.js");

// We use our firebase-admin mock
jest.mock("firebase-admin");

const app = require("../server");

describe("Actions", () => {
  const request = require("supertest");
  const agent = request.agent(app);
  let existingId = null;

  beforeAll(done => {
    //Before all we empty the database
    Action.deleteMany({}, err => {
      done();
    });
  });

  beforeEach(done => {
    // And create a few dummy elements
    Action.create(
      {
        title: "Testing title",
        image: "image.jpg",
        text: "Test text",
        // We add owner with the same string that auth mock
        // req.user = "userTokenid" so the ownership validation pass by default
        owner: "userTokenid",
        likes: 25,
        comments: [
          {
            body: "Text comment",
            date: Date.now(),
            userId: "otherUserId"
          }
        ]
      },
      (err, action) => {
        existingId = action._id;
        done();
      }
    );
  });

  afterAll(done => {
    // we stop the express server
    require("../server").stop();
    done();
  });

  /* GET /actions test */
  describe("GET /actions", () => {
    it("It should response the GET method with status 200 and the actions array", done => {
      agent
        .get("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data[0].type).toBe("actions");
          expect(response.body.data).toHaveLength(1);
          done();
        });
    });
  });

  /* GET /actions/:actionId test */
  describe("GET /actions/:actionId", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("actions");
          expect(response.body.data.attributes.title).toBe("Testing title");
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(`/api/v1/actions/${mongoose.Types.ObjectId()}`)
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  /* GET /actions/:actionId?include=all test */
  describe("GET /actions/:actionId?include=all", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}?include=all`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("actions");
          expect(response.body.data.attributes.title).toBe("Testing title");
          expect(response.body.included).toBeDefined();
          expect(response.body.included[0].type).toBe("people");
          expect(response.body.included[0].attributes.username).toBeDefined();
          expect(response.body.included[1].type).toBe("comments");
          expect(response.body.included[1].attributes.body).toBe(
            "Text comment"
          );
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(`/api/v1/actions/${mongoose.Types.ObjectId()}`)
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  /* GET /actions/:actionId/relationships/user test */
  describe("GET /actions/:actionId/relationships/user", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}/relationships/user`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("people");
          expect(response.body.data.id).toBe("userTokenid");
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(`/api/v1/actions/${mongoose.Types.ObjectId()}/relationships/user`)
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123/relationships/user")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  /* GET /actions/:actionId/relationships/comments test */
  describe("GET /actions/:actionId/relationships/comments", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}/relationships/comments`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data[0].type).toBe("comments");
          expect(response.body.data[0].id).toBeDefined();
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(
          `/api/v1/actions/${mongoose.Types.ObjectId()}/relationships/comments`
        )
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123/relationships/comments")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  /* GET /actions/:actionId/comments test */
  describe("GET /actions/:actionId/comments", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}/comments`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data[0].type).toBe("comments");
          expect(response.body.data[0].attributes.body).toBe("Text comment");
          expect(response.body.data[0].attributes.from.id).toBeDefined();
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(
          `/api/v1/actions/${mongoose.Types.ObjectId()}/relationships/comments`
        )
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123/relationships/comments")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  /* GET /actions/:actionId/user test */
  describe("GET /actions/:actionId/user", () => {
    it("It should response the GET method with status 200 and proper action", done => {
      agent
        .get(`/api/v1/actions/${existingId}/user`)
        .set("Accept", "application/vnd.api+json")
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("people");
          expect(response.body.data.relationships.actions).toBeDefined();
          expect(response.body.data.relationships.comments).toBeDefined();
          done();
        });
    });

    it("It should response the GET method with status 404 and Action not found error", done => {
      agent
        .get(
          `/api/v1/actions/${mongoose.Types.ObjectId()}/relationships/comments`
        )
        .set("Accept", "application/vnd.api+json")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("It should response the GET method with status 422 and Cast to ObjectId error", done => {
      agent
        .get("/api/v1/actions/123123/relationships/comments")
        .set("Accept", "application/vnd.api+json")
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "123123" at path "_id" for model "Action"'
          );
          done();
        });
    });
  });

  // POST /actions
  describe("POST /actions", () => {
    it("should get a 401 Unauthorized error if no Authorization header is sent", done => {
      const actionPayload = {
        data: {
          type: "actions",
          attributes: {
            title: "Testing title",
            image: "image.jpg",
            text: "Test text"
          }
        }
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .send(actionPayload)
        .expect(401)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("401");
          expect(response.body.errors[0].title).toBe("No authenticated");
          done();
        });
    });
    it("should get a 401 error if invalid Authorization token sent", done => {
      const actionPayload = {
        data: {
          type: "actions",
          attributes: {
            title: "Testing title",
            image: "image.jpg",
            text: "Test text"
          }
        }
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer BadToken")
        .send(actionPayload)
        .expect(401)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("401");
          expect(response.body.errors[0].title).toBe("Invalid token");
          done();
        });
    });
    it("should NOT post an action without all the required fields", done => {
      const actionPayload = {
        data: {
          type: "actions",
          attributes: {
            title: "Testing title",
            image: "image.jpg"
            //text: "Test text"
          }
        }
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send(actionPayload)
        .expect(400)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].detail).toBe(
            "You must provide title, text and image"
          );
          done();
        });
    });

    it("should NOT post an action without the proper body structure", done => {
      const actionPayload = {
        title: "Testing title",
        image: "image.jpg"
        //text: "Test text"
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send(actionPayload)
        .expect(400)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].detail).toBe(
            "The request MUST include a single resource object as primary data"
          );
          done();
        });
    });

    it("should get casting ERROR when posting an action with the wrong data type", done => {
      const actionPayload = {
        data: {
          type: "actions",
          attributes: {
            title: { foo: "bar" },
            image: "image.jpg",
            text: "Test text"
          }
        }
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send(actionPayload)
        .expect(500)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("500");
          expect(response.body.errors[0].detail).toBe(
            `Action validation failed: title: Cast to String failed for value \"{ foo: 'bar' }\" at path \"title\"`
          );
          done();
        });
    });

    it("should post an action", done => {
      const actionPayload = {
        data: {
          type: "actions",
          attributes: {
            title: "Testing title POST",
            image: "image.jpg",
            text: "Test text"
          }
        }
      };
      agent
        .post("/api/v1/actions")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send(actionPayload)
        .expect(201)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.links).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("actions");
          expect(response.body.data.attributes.title).toBe(
            "Testing title POST"
          );
          done();
        });
    });
  });

  //PATCH /actions/:actionId
  describe("PATCH /actions/:actionId", () => {
    it("should update an Action given the proper id, Auth Bearer token and being the owner", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            attributes: {
              title: "Testing title PUT",
              image: "image.jpg",
              text: "Test text"
            }
          }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.links).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data.type).toBe("actions");
          expect(response.body.data.attributes.title).toBe("Testing title PUT");
          done();
        });
    });

    it("should response with status 404 and Action not found error if an action with the id doesn't exist", done => {
      agent
        .patch(`/api/v1/actions/${mongoose.Types.ObjectId()}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: mongoose.Types.ObjectId(),
            attributes: {
              title: "Testing title PUT",
              image: "image.jpg",
              text: "Test text"
            }
          }
        })
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("should response with status 403 and Forbidden error when auth user is different than action owner", done => {
      // In this case we create an expecific doc with a different owner to force the error
      Action.create(
        {
          title: "Testing title",
          image: "image.jpg",
          text: "Test text",
          owner: "userTokenidBAD"
        },
        (err, action) => {
          existingId = action._id;

          agent
            .patch(`/api/v1/actions/${existingId}`)
            .set("Accept", "application/vnd.api+json")
            .set("Content-Type", "application/vnd.api+json")
            .set("Authorization", "Bearer GoodToken")
            .send({
              data: {
                type: "actions",
                id: existingId,
                attributes: {
                  title: "Testing title PUT",
                  image: "image.jpg",
                  text: "Test text"
                }
              }
            })
            .expect(403)
            .then(response => {
              expect(response.body.errors).toBeDefined();
              expect(response.body.data).toBeUndefined();
              expect(response.body.errors[0].status).toBe("403");
              expect(response.body.errors[0].title).toBe("Forbidden");
              done();
            });
        }
      );
    });

    it("should response with status 422 and Cast to ObjectId error if the format of the id is not correct", done => {
      agent
        .patch("/api/v1/actions/1231234")
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: "1231234",
            attributes: {
              title: "Testing title PUT",
              image: "image.jpg",
              text: "Test text"
            }
          }
        })
        .expect(422)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("422");
          expect(response.body.errors[0].detail).toBe(
            'Cast to ObjectId failed for value "1231234" at path "_id" for model "Action"'
          );
          done();
        });
    });

    it("should get casting ERROR when updating an action with the wrong body data type", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: "1231234",
            attributes: {
              title: { foo2: "bar2" },
              image: "image.jpg",
              text: "Test text"
            }
          }
        })
        .expect(500)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("500");
          expect(response.body.errors[0].detail).toBe(
            `Action validation failed: title: Cast to String failed for value \"{ foo2: 'bar2' }\" at path \"title\"`
          );
          done();
        });
    });
  });

  describe("PATCH /actions/:actionId with relationships", () => {
    it("should update an Action relationship given the proper id, likes relationship payload, Auth Bearer token and being the owner", done => {
      agent
        .patch(`/api/v1/actions/${existingId}?include=all`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              likes: {
                data: [
                  {
                    type: "people",
                    id: "userTokenid"
                  }
                ]
              }
            }
          }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.links).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.included).toBeDefined();
          expect(response.body.data.attributes.likes.count).toBe(1);
          done();
        });
    });

    it("should update an Action relationship given the proper payload and not return included property if not include param", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              likes: {
                data: [
                  {
                    type: "people",
                    id: "userTokenid"
                  }
                ]
              }
            }
          }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.links).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.included).toBeUndefined();
          expect(response.body.data.attributes.likes.count).toBe(1);
          done();
        });
    });

    it("should response with 400 and Bad request when update an Action with wrong relationship payload", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              likes: {
                data: [
                  {
                    type: "people"
                    //id: "userTokenid"
                  }
                ]
              }
            }
          }
        })
        .expect(400)
        .then(response => {
          expect(response.body.data).toBeUndefined();
          expect(response.body.links).toBeUndefined();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].title).toBe("Bad Request");
          done();
        });
    });

    it("should response with 400 and Bad request when update an Action Relationship with a user id diferent than the auth user", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              likes: {
                data: [
                  {
                    type: "people",
                    id: "otherTokenid"
                  }
                ]
              }
            }
          }
        })
        .expect(400)
        .then(response => {
          expect(response.body.data).toBeUndefined();
          expect(response.body.links).toBeUndefined();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].title).toBe("Bad Request");
          done();
        });
    });

    it("should update an Action relationship given the proper id, comments relationship payload, Auth Bearer token and being the owner", done => {
      agent
        .patch(`/api/v1/actions/${existingId}?include=all`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              comments: {
                data: [
                  {
                    type: "commnets",
                    attributes: {
                      userId: "userTokenid",
                      body: "I'm a test coment",
                      date: Date.now()
                    }
                  }
                ]
              }
            }
          }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.links).toBeDefined();
          expect(response.body.errors).toBeUndefined();
          expect(response.body.included).toBeDefined();
          expect(response.body.data.attributes.comments.count).toBe(2);
          done();
        });
    });

    it("should response with 400 and Bad request when update an Action Relationship with a user id diferent than the auth user", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              comments: {
                data: [
                  {
                    type: "commnets",
                    attributes: {
                      userId: "otherTokenid",
                      body: "I'm a test coment",
                      date: Date.now()
                    }
                  }
                ]
              }
            }
          }
        })
        .expect(400)
        .then(response => {
          expect(response.body.data).toBeUndefined();
          expect(response.body.links).toBeUndefined();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].title).toBe("Bad Request");
          done();
        });
    });

    it("should response with 400 and Bad request when update an Action Relationship with a incorrect payload", done => {
      agent
        .patch(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Content-Type", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .send({
          data: {
            type: "actions",
            id: existingId,
            relationships: {
              comments: {
                data: [
                  {
                    type: "commnets",
                    attributes: {
                      userId: "otherTokenid",
                      //body: "I'm a test coment",
                      date: Date.now()
                    }
                  }
                ]
              }
            }
          }
        })
        .expect(400)
        .then(response => {
          expect(response.body.data).toBeUndefined();
          expect(response.body.links).toBeUndefined();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].status).toBe("400");
          expect(response.body.errors[0].title).toBe("Bad Request");
          done();
        });
    });
  });

  describe("DELETE /actions/:actionId", () => {
    it("should response the DELETE method with status 404 and Action not found error ", done => {
      agent
        .delete(`/api/v1/actions/${mongoose.Types.ObjectId()}`)
        .set("Accept", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .expect(404)
        .then(response => {
          expect(response.body.errors).toBeDefined();
          expect(response.body.data).toBeUndefined();
          expect(response.body.errors[0].status).toBe("404");
          expect(response.body.errors[0].title).toBe("Action not found");
          done();
        });
    });

    it("should response the DELETE method with status 403 and Forbidden error ", done => {
      // In this case we create an expecific doc with a different owner to force the error
      Action.create(
        {
          title: "Testing title",
          image: "image.jpg",
          text: "Test text",
          owner: "userTokenidBAD"
        },
        (err, action) => {
          existingId = action._id;

          agent
            .delete(`/api/v1/actions/${existingId}`)
            .set("Accept", "application/vnd.api+json")
            .set("Authorization", "Bearer GoodToken")
            .expect(403)
            .then(response => {
              expect(response.body.errors).toBeDefined();
              expect(response.body.data).toBeUndefined();
              expect(response.body.errors[0].status).toBe("403");
              expect(response.body.errors[0].title).toBe("Forbidden");
              done();
            });
        }
      );
    });

    it("should DELETE an Action given the id and return 204 - No Content", done => {
      agent
        .delete(`/api/v1/actions/${existingId}`)
        .set("Accept", "application/vnd.api+json")
        .set("Authorization", "Bearer GoodToken")
        .expect(204)
        .then(response => {
          expect(response.body.errors).toBeUndefined();
          expect(response.body.data).toBeUndefined();
          done();
        });
    });
  });
});
