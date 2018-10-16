import firebase from "firebase/app";
import "firebase/auth";

// Initialize Firebase
var config = {
  apiKey: "APIKEY",
  authDomain: "AUTH_DOMAIN",
  databaseURL: "DATABASE_URL",
  projectId: "resistance-3ca4c",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "SENDER_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();

export { auth };
