import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";
import { fetchActions } from "../../apiCalls";

import App from "./App";
// Import components rendered on App
import Actions from "../Actions/Actions";

// We call jest.mock('../request') to tell Jest to use our manual mock.
// it expects the return value to be a Promise that is going to be resolved.
// You can chain as many Promises as you like and call expect at any time,
// as long as you return a Promise at the end.
// https://jestjs.io/docs/en/tutorial-async
jest.mock("../../apiCalls.js");

describe("App", () => {
  describe("componentDidMount", () => {
    it("sets the state componentDidMount", async () => {
      const renderedComponent = await shallow(<App />);
      await renderedComponent.update();
      expect(renderedComponent.state("response")).toEqual("Hello from express");
    });

    it("sets the state componentDidMount on error", async () => {
      const renderedComponent = await shallow(<App />);
      await renderedComponent.update();
      expect(renderedComponent.state("errorStatus")).toEqual(
        "Error fetching hello"
      );
    });
  });
  describe("render", () => {
    it("renders shallow without crashing", () => {
      shallow(<App />);
    });
  });
});
