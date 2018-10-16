// Since we don't want to go to the network in our test,
// we are create a manual mock for our apiCalls.js
// overriding our methods with the same signature

export const fetchActions = jest
  .fn()
  // We have to call mockImplementationOnce for each test that calls fetchActions
  // and simulate the desire promise (using async) for each one

  // call for test: sets the state componentDidMount
  .mockImplementationOnce(async () => ({
    success: true,
    actions: [
      {
        _id: 1489863729151,
        title: "Rutabagas",
        text: "testing text",
        image: "image.jpg",
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString()
      },
      {
        _id: 1489863740047,
        title: "Beef Jerky",
        text: "testing text 2",
        image: "image.jpg",
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString()
      }
    ]
  }))
  // call for test: sets the state componentDidMount on error
  .mockImplementationOnce(async () => {
    throw new Error("Error fetching actions");
  })
  //call for test: renders shallow without crashing
  .mockImplementationOnce(async () => ({
    success: true,
    actions: []
  }))
  //call for test: renders the ActionsList
  .mockImplementationOnce(async () => ({
    success: true,
    actions: []
  }))
  //call for test: renders the ActionForm
  .mockImplementationOnce(async () => ({
    success: true,
    actions: []
  }))
  //call for test: renders the Error message with right error if error ocurrs
  .mockImplementationOnce(async () => {
    throw new Error("Error fetching actions");
  })
  //call for test: don't render the Error message if no error ocurrs
  .mockImplementationOnce(async () => ({
    success: true,
    actions: []
  }));

export const fetchHello = jest
  .fn()
  .mockImplementationOnce(() => ({
    message: "Hello from express"
  }))
  .mockImplementationOnce(() => {
    throw new Error("Error fetching hello");
  });
