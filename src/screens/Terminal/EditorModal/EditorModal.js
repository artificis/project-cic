import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import autobind from 'autobind-decorator';
import AceEditor from 'react-ace';
import {
  Modal, ModalBody, ModalFooter, Button,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { modalOpenSelector, cicDataSelector, closeModal, setCicData } from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import TableView from './TableView';

import 'brace/mode/json';
import 'brace/theme/solarized_light';
import 'brace/ext/searchbox';

const mapStateToProps = createStructuredSelector({
  open: modalOpenSelector,
  cicData: cicDataSelector
});

const mapDispatchToProps = {
  closeModal,
  setCicData,
  log,
  setTerminalBusy
};

@connect(mapStateToProps, mapDispatchToProps)
export default class EditorModal extends React.Component {
  state = {
    activeTab: 'edit',
    cicDataText: ''
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open === false && nextProps.open === true) {
      this.setState({ cicDataText: JSON.stringify(nextProps.cicData) });
    }
  }

  switchTabTo(tabId) {
    if (this.state.activeTab !== tabId) {
      this.setState({ activeTab: tabId });
    }
  }

  @autobind
  handleCloseClick() {
    const { closeModal, log, setTerminalBusy } = this.props;
    closeModal();
    log('&nbsp;');
    setTerminalBusy(false);
  }

  @autobind
  handleAceEditorChange(newValue) {
    this.setState({ cicDataText: newValue });
  }

  @autobind
  handleEditTabClick() {
    this.switchTabTo('edit');
    this.aceEditor.editor.focus();
  }

  @autobind
  handleViewTabClick() {
    try {
      const json = JSON.parse(this.state.cicDataText);
      this.props.setCicData(json);
      this.switchTabTo('view');
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert('Invalid JSON data');
      }
    }
  }

  render() {
    const { open, cicData } = this.props;
    const { activeTab, cicDataText } = this.state;

    return (
      <Modal isOpen={open} id="cic_data_modal">
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'edit' })}
                onClick={this.handleEditTabClick}
              >
                Edit
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'view' })}
                onClick={this.handleViewTabClick}
              >
                View
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="edit" className="py-3">
              <AceEditor
                mode="json"
                theme="solarized_light"
                value={cicDataText}
                tabSize={2}
                showPrintMargin={false}
                width="100%"
                height="100%"
                ref={e => { this.aceEditor = e; }}
                onChange={this.handleAceEditorChange}
              />
            </TabPane>
            <TabPane tabId="view" className="py-3">
              <TableView data={cicData} />
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" size="sm" role="button">Save</Button>
          <Button color="primary" outline size="sm">Save & Close</Button>
          <Button color="secondary" outline size="sm" onClick={this.handleCloseClick}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
