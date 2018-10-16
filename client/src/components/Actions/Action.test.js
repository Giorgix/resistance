import React from "react";
import ReactDOM from "react-dom";
import { shallow, mount } from "enzyme";
import { fetchActions } from "../../apiCalls";

// Import components rendered on App
import Action from "./Action";

// We call jest.mock('../../apiCalls.js') to tell Jest to use our manual mock.
// it expects the return value to be a Promise that is going to be resolved.
// You can chain as many Promises as you like and call expect at any time,
// as long as you return a Promise at the end.
// https://jestjs.io/docs/en/tutorial-async
jest.mock("../../apiCalls.js");

describe("Action", () => {
  describe("render", () => {
    it("renders shallow without crashing", () => {
      shallow(
        <Action
          title={""}
          image={""}
          key={""}
          id={""}
          timestamp={""}
          handleUpdateAction={() => {}}
          handleDeleteAction={() => {}}
          handleLike={() => {}}
        >
          {""}
        </Action>
      );
    });
    it("calls the correct function when clicking on delete", () => {
      const handleDeleteActionMock = jest.fn();
      const wrapper = shallow(
        <Action
          title={""}
          image={""}
          key={""}
          id={""}
          timestamp={""}
          handleUpdateAction={() => {}}
          handleDeleteAction={handleDeleteActionMock}
          handleLike={() => {}}
        >
          {""}
        </Action>
      );

      const deleteBtnElement = wrapper.find(".delete-btn");
      deleteBtnElement.simulate("click");

      expect(handleDeleteActionMock).toHaveBeenCalledTimes(1);
    });
    it("calls the correct function when clicking on update", () => {
      const handleUpdateActionMock = jest.fn();
      const wrapper = shallow(
        <Action
          title={""}
          image={""}
          key={""}
          id={""}
          timestamp={""}
          handleUpdateAction={handleUpdateActionMock}
          handleDeleteAction={() => {}}
          handleLike={() => {}}
        >
          {""}
        </Action>
      );

      const updateBtnElement = wrapper.find(".update-btn");
      updateBtnElement.simulate("click");

      expect(handleUpdateActionMock).toHaveBeenCalledTimes(1);
    });
    it("renders title pass as prop properly", () => {
      const wrapper = mount(
        <Action
          title={"Testing props"}
          image={""}
          key={""}
          id={""}
          timestamp={""}
          handleUpdateAction={() => {}}
          handleDeleteAction={() => {}}
          handleLike={() => {}}
        >
          {""}
        </Action>
      );
      expect(wrapper.find("h2").text()).toBe("Testing props");
    });
    it("renders children properly", () => {
      const wrapper = mount(
        <Action
          title={""}
          image={""}
          key={""}
          id={""}
          timestamp={""}
          handleUpdateAction={() => {}}
          handleDeleteAction={() => {}}
          handleLike={() => {}}
        >
          {"Children test"}
        </Action>
      );
      expect(wrapper.find("p.card-text").text()).toBe("Children test");
    });
  });
});
