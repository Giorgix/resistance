import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";
import { fetchActions } from "../../apiCalls";

import Actions from "./Actions";
// Import components rendered on App
import ActionsList from "./ActionsList";
import ActionForm from "./ActionForm";

// We call jest.mock('../../apiCalls.js') to tell Jest to use our manual mock.
// it expects the return value to be a Promise that is going to be resolved.
// You can chain as many Promises as you like and call expect at any time,
// as long as you return a Promise at the end.
// https://jestjs.io/docs/en/tutorial-async
jest.mock("../../apiCalls.js");

describe("Actions", () => {
  describe("componentDidMount", () => {
    it("sets the state componentDidMount", async () => {
      const renderedComponent = await shallow(<Actions />);
      await renderedComponent.update();
      expect(renderedComponent.state("data")).toHaveLength(2);
    });

    it("sets the state componentDidMount on error", async () => {
      const renderedComponent = await shallow(<Actions />);
      await renderedComponent.update();
      expect(renderedComponent.state("errorStatus")).toEqual(
        "Error fetching actions"
      );
    });
  });
  describe("render", () => {
    it("renders shallow without crashing", () => {
      shallow(<Actions />);
    });
    it("renders the ActionsList", async () => {
      const wrapper = await shallow(<Actions />);
      await wrapper.update();
      expect(wrapper.find(ActionsList)).toHaveLength(1);
    });
    it("renders the ActionForm", async () => {
      const wrapper = await shallow(<Actions />);
      await wrapper.update();
      expect(wrapper.find(ActionForm)).toHaveLength(1);
    });
    it("renders the Error message with right error if error ocurrs", async () => {
      const wrapper = await shallow(<Actions />);
      await wrapper.update();
      expect(wrapper.find(".error-message").text()).toBe(
        "Error fetching actions"
      );
    });
    it("don't render the Error message if no error ocurrs", async () => {
      const wrapper = await shallow(<Actions />);
      await wrapper.update();
      expect(wrapper.find(".error-message")).toHaveLength(0);
    });
  });
});
