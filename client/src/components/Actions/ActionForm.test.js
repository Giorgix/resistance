import React from "react";
import ReactDOM from "react-dom";
import { shallow, mount } from "enzyme";
//import { fetchActions } from "../../apiCalls";

// Import components rendered on App
import ActionForm from "./ActionForm";

// We call jest.mock('../../apiCalls.js') to tell Jest to use our manual mock.
// it expects the return value to be a Promise that is going to be resolved.
// You can chain as many Promises as you like and call expect at any time,
// as long as you return a Promise at the end.
// https://jestjs.io/docs/en/tutorial-async
//jest.mock("../../apiCalls.js");

describe("ActionForm", () => {
  it("renders without crashing", () => {
    shallow(
      <ActionForm
        title={""}
        text={""}
        image={""}
        handleChangeText={() => {}}
        submitAction={() => {}}
        dialogOpen={true}
        handleDialogClose={() => {}}
      />
    );
  });

  it("calls correct function when changing input", () => {
    const handleChangeTextMock = jest.fn();
    // Create the shallow wrapper with a mock function
    const wrapper = mount(
      <ActionForm
        title={""}
        text={""}
        image={""}
        handleChangeText={handleChangeTextMock}
        submitAction={() => {}}
        dialogOpen={true}
        handleDialogClose={() => {}}
      />
    );
    const inputElement = wrapper.find("input[name='title']"); // step 1 above

    // Simulate the change event with a mock object for event
    const event = { target: { name: "title", value: "Testing" } };
    inputElement.simulate("change", event);

    // Check that the function was called once
    expect(handleChangeTextMock).toHaveBeenCalledTimes(1);
    // Since we use mount the real event now is emited
    // and it doesnt much our mocj event when using shallow
    // expect(handleChangeTextMock).toHaveBeenCalledWith(event);
  });

  it("calls correct function to create action", () => {
    const onButtonClickMock = jest.fn();
    // Create the shallow wrapper with a mock function
    const wrapper = mount(
      <ActionForm
        title={""}
        text={""}
        image={""}
        handleChangeText={() => {}}
        submitAction={onButtonClickMock}
        dialogOpen={true}
        handleDialogClose={() => {}}
      />
    );

    // Simulate the submit event with a mock object for event
    const buttonElement = wrapper.find("form"); // step 1 above
    buttonElement.simulate("submit", {
      preventDefault: () => {},
      currentTarget: { reset: () => {} }
    });

    // Check that the function was called once with the right parameters
    expect(onButtonClickMock).toHaveBeenCalledTimes(1);
  });
});
