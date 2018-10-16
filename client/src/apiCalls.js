import { firebase } from "./firebase/";

export const fetchApi = (endpoint, method = "GET", headers = {}) => {
  return fetch(endpoint, {
    method,
    //TODO filter if it's sending data to add the content-type header and add additional headers passed
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      ...headers
    }
  });
};

// We create a wrapper of fetch to get the auth_token from firebase API
// and pass it as a Authorization Bearer header
export const fetchApiAuth = async (
  endpoint,
  method = "GET",
  headers = {},
  payload = {}
) => {
  const currentUser = firebase.auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken(/* forceRefresh */ true);
    if (token) {
      return fetch(endpoint, {
        method,
        //TODO filter if it's sending data to add the content-type header and add additional headers passed
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: "Bearer " + token,
          ...headers
        },
        // We use JSON.stringyfy to convert the payload object to a string
        body: JSON.stringify(payload)
      });
    } else {
      return fetchApi(endpoint, method, headers, payload);
    }
  } else {
    return fetchApi(endpoint, method, headers, payload);
  }
};

export const fetchActions = async () => {
  const response = await fetch("/api/v1/actions", {
    headers: {
      Accept: "application/vnd.api+json"
    }
  });
  if (response.status >= 400) {
    // Throw inside an async function is like reject
    // we'll use fetchActions.catch later to get the error
    throw new Error("Error getting actions");
  } else {
    // The returned value inside an async function is like resolve
    // we'll use fetchActions.then later to get the result
    return await response.json();
  }
};
export const fetchHello = async () => {
  const response = await fetch("/api/v1/hello");
  if (response.status >= 400) {
    throw new Error("Error fetching hello");
  } else {
    return await response.json();
  }
};
