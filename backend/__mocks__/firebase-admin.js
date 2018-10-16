const admin = jest.genMockFromModule("firebase-admin");

// We mock the credential object with the cert function
// that we pass as config to initializeApp
export const credential = {
  cert: function() {
    return "crednetial";
  }
};

// We mock the initializeApp constructor
export const initializeApp = function() {
  return;
};

// We mock the firebase.auth.getUser method
export const auth = function() {
  return {
    verifyIdToken: function(token) {
      return new Promise(function(resolve, reject) {
        if (token === "GoodToken") {
          resolve({
            uid: "userTokenid"
          });
        } else {
          reject({
            error: { message: "Bad token" }
          });
        }
      });
    },
    getUser: function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve({
            toJSON: function() {
              return {
                displayName: "foo",
                photoURL: "image.jpg"
              };
            }
          });
        }, 300);
      });
    }
  };
};
