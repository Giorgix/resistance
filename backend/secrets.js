// Require and configure dotenv to handle Enviroment Variable.
require("dotenv").config({ path: "../.env" });

const secrets = {
  dbURI: process.env.DB_URI
};

export const getSecret = key => secrets[key];
