import React, { Component } from "react";

// We can import assets like this
//import logo from "./logo.svg";
import "./Home.css";

class Home extends Component {
  state = {
    response: "",
    errorStatus: ""
  };

  render() {
    return (
      <div className="text--center">
        {this.state.errorStatus && (
          <p className="error">{this.state.errorStatus}</p>
        )}
        <h2 className="center-align">HOME</h2>
        {/*<p className="App-intro">{this.state.response}</p>*/}
      </div>
    );
  }
}

export default Home;
