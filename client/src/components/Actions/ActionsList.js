import React from "react";
import PropTypes from "prop-types";
import { Grid, Label, Sticky } from "semantic-ui-react";

import Action from "./Action";

class ActionList extends React.Component {
  state = {};
  handleContextRef = contextRef => this.setState({ contextRef });

  render() {
    const { contextRef } = this.state;
    const actionItems = this.props.actions.map(action => (
      <Action
        attributes={action.attributes}
        key={action.id}
        id={action.id}
        uid={action.relationships.user.data.id}
      >
        {action.attributes.text}
      </Action>
    ));

    return (
      <div ref={this.handleContextRef}>
        <Grid stackable reversed="mobile">
          <Grid.Column width={12}>{actionItems}</Grid.Column>
          <Grid.Column width={4}>
            <Sticky context={contextRef} offset={16}>
              <h3>Topics</h3>
              <Label.Group color="blue" className="scrollable-horiz">
                <Label as="a">Sexual Assault</Label>
                <Label as="a">Inmigration</Label>
                <Label as="a">Women's Rights</Label>
                <Label as="a">Donald Trump</Label>
                <Label as="a">Climate Change</Label>
              </Label.Group>
            </Sticky>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

ActionList.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      attributes: {
        title: PropTypes.string,
        text: PropTypes.string,
        image: PropTypes.string,
        updatedAt: PropTypes.string
      }
    })
  ).isRequired
};

ActionList.defaultProps = {
  actions: []
};

export default ActionList;
