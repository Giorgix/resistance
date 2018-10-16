import React from "react";
import PropTypes from "prop-types";

import { Modal, Form } from "semantic-ui-react";

import "./ActionForm.css";

const ActionForm = props => (
  <Modal open={props.dialogOpen} onClose={props.handleDialogClose} closeIcon>
    {props.editingAction ? (
      <Modal.Header>Edit your action</Modal.Header>
    ) : (
      <Modal.Header>Create an action</Modal.Header>
    )}
    <Modal.Content>
      <h3>
        An Action can be anything from a rally, fundraising, petition, link to a
        campaign, etc...
      </h3>

      <Form onSubmit={props.submitAction}>
        <Form.Group widths="equal">
          <Form.Input
            name="title"
            onChange={props.handleChangeText}
            fluid
            required
            value={props.title}
            label="Name your action"
            placeholder="Campaign to help refugees in Spain"
          />
          <Form.Input
            name="image"
            onChange={props.handleChangeText}
            fluid
            required
            value={props.image}
            label="Image link for your action"
            placeholder="http://example.com/image.jpg"
          />
        </Form.Group>
        <Form.TextArea
          name="text"
          required
          value={props.text}
          onChange={props.handleChangeText}
          label="Describe your action"
          placeholder="We are looking for volunteers to help with..."
        />
        {props.editingAction ? (
          <Form.Button type="submit" color="green">
            Save
          </Form.Button>
        ) : (
          <Form.Button type="submit" color="blue">
            Submit
          </Form.Button>
        )}
      </Form>
    </Modal.Content>
  </Modal>
);

ActionForm.propTypes = {
  submitAction: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  handleDialogClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  text: PropTypes.string,
  image: PropTypes.string
};

ActionForm.defaultProps = {
  title: "",
  text: "",
  image: ""
};

export default ActionForm;
