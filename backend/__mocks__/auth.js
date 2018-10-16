// We could mock the auth middleware to simulate the real behavior but
// we are doing it mocking the whole firebase-admin module instead
export const isAuthenticated = jest
  .fn()
  .mockImplementation((req, res, next) => {
    if (req.headers && req.headers.authorization) {
      if (req.headers.authorization.split(" ")[1] === "GoodToken") {
        // We simulate the respnse of a successfull auth response
        req.user = "userTokenid";
        next();
      }
      if (req.headers.authorization.split(" ")[1] === "BadToken") {
        // We simulate the response of a invalid token
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
      }
    } else {
      // We simulate the response when ther is no Authorization header
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
  });
