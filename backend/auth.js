import * as admin from "firebase-admin";

var serviceAccount = require("./resistance-3ca4c-firebase-adminsdk-adckc-f19b932daf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://resistance-3ca4c.firebaseio.com"
});

export const isAuthenticated = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    // TODO check if the authorization type is Bearer otherwise return proper error
    admin
      .auth()
      .verifyIdToken(req.headers.authorization.split(" ")[1]) // We split the string to get the token after Bearer
      .then(function(decodedToken) {
        req.user = decodedToken.uid;
        next();
      })
      .catch(function(error) {
        const errObject = {
          status: "401",
          code: "AUTH_401_token",
          title: "Invalid token",
          detail:
            "The access token provided is expired, revoked, malformed, or invalid for other reasons"
        };

        return res.status(401).json({
          errors: [errObject]
        });
      });
  } else {
    const errObject = {
      status: "401",
      code: "AUTH_401_token",
      title: "No authenticated",
      detail: "Missing authentication"
    };

    return res
      .set("WWW-Authenticate", "Bearer")
      .status(401)
      .json({
        errors: [errObject]
      });
  }
};
