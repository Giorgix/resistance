import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";
//import { fetchActions } from "../../apiCalls";

import ActionsList from "./ActionsList";
// Import components rendered on App
import Action from "./Action";

// We call jest.mock('../../apiCalls.js') to tell Jest to use our manual mock.
// it expects the return value to be a Promise that is going to be resolved.
// You can chain as many Promises as you like and call expect at any time,
// as long as you return a Promise at the end.
// https://jestjs.io/docs/en/tutorial-async
//jest.mock("../../apiCalls.js");

describe("ActionsList", () => {
  describe("render", () => {
    it("renders shallow without crashing", () => {
      shallow(
        <ActionsList
          actions={[]}
          handleDeleteAction={() => {}}
          handleUpdateAction={() => {}}
          handleLike={() => {}}
        />
      );
    });
    it("renders an action per item passed as the prop actions(Array)", async () => {
      const wrapper = await shallow(
        <ActionsList
          actions={[
            {
              _id: "1489863729151",
              title: "Rutabagas",
              text: "testing text",
              image: "image.jpg",
              createdAt: Date.now().toString(),
              updatedAt: Date.now().toString()
            },
            {
              _id: "1489863740047",
              title: "Beef Jerky",
              text: "testing text 2",
              image: "image.jpg",
              createdAt: Date.now().toString(),
              updatedAt: Date.now().toString()
            }
          ]}
          handleDeleteAction={() => {}}
          handleUpdateAction={() => {}}
          handleLike={() => {}}
        />
      );

      await wrapper.update();
      expect(wrapper.find(Action)).toHaveLength(2);
    });
    /*it("renders the Action", async () => {
      const wrapper = await shallow(<Actions />);
      await wrapper.update();
      expect(wrapper.find(ActionsList)).toHaveLength(1);
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
    });*/
  });
});
