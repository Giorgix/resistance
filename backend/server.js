// first we import our dependencies…
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import logger from "morgan";
import mongoose from "mongoose";
import { isAuthenticated } from "./auth";

import { getSecret } from "./secrets";
// We import all the API endpoints functions for actions to improve code readability
import * as actions from "./api.actions";

// db config amd conenction
mongoose.connect(
  getSecret("dbURI"),
  { useNewUrlParser: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 5000;

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(logger("dev"));

// now we can set the route path & initialize the API Calls
router.get("/secret", isAuthenticated, (req, res) => {
  //console.log(req);
  res.status(200).json({ message: "Hello, World!" });
});

// Actions API - CRUD
router.get("/actions", actions.getAll);

router.get("/actions/:actionId", actions.getById);

router.get("/actions/:actionId/relationships/user", actions.getByIdUserRel);

router.get(
  "/actions/:actionId/relationships/comments",
  actions.getByIdCommentsRel
);

router.get("/actions/:actionId/comments", actions.getByIdComments);

router.get("/actions/:actionId/user", actions.getByIdUser);

router.post("/actions", isAuthenticated, actions.post);

router.patch("/actions/:actionId", isAuthenticated, actions.update);

router.delete("/actions/:actionId", isAuthenticated, actions.remove);

// Set response headers for all api requests following JSON api spec
// http://jsonapi.org/format/#content-negotiation-servers
app.use("/api/v1", function(req, res, next) {
  res.set("Content-Type", "application/vnd.api+json");
  next();
});
// Use our router configuration when we call /api
app.use("/api/v1", router);

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "/../client/build")));
  // Handle React routing, return all requests to React app
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "/../client/build", "index.html"));
  });
}

const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// for testing
function stop() {
  server.close();
}

module.exports = app; // for testing
module.exports.stop = stop; // for testing
