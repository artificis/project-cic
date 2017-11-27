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
import {
  modalOpenSelector, modalUiEnabledSelector, modalModeSelector,
  modalFilePathSelector,imageBlobSelector, cicDataSelector,
  closeModal, setCicData
} from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { currentProjectSelector, createFile } from 'services/repo';
import TableView from './TableView';

import 'brace/mode/json';
import 'brace/theme/solarized_light';
import 'brace/ext/searchbox';

const mapStateToProps = createStructuredSelector({
  open: modalOpenSelector,
  uiEnabled: modalUiEnabledSelector,
  mode: modalModeSelector,
  filePath: modalFilePathSelector,
  imageBlob: imageBlobSelector,
  cicData: cicDataSelector,
  currentProject: currentProjectSelector
});

const mapDispatchToProps = {
  closeModal,
  setCicData,
  log,
  setTerminalBusy,
  createFile
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
        this.aceEditor.editor.focus();
        alert('Invalid JSON data');
      }
    }
  }

  @autobind
  handleSaveClick() {
    const { mode, filePath, imageBlob, cicData, currentProject, createFile } = this.props;
    if (mode === 'create') {
      createFile({
        projectId: currentProject.id,
        filePath: encodeURIComponent(filePath),
        branch: currentProject.defaultBranch || 'master',
        options: {
          content: btoa(`${imageBlob}PROJECT-CIC${btoa(JSON.stringify(cicData))}`),
          commit_message: 'Test commit',
          encoding: 'base64'
        }
      });
    } else if (mode === 'update') {
      console.log('TODO')
    }
  }

  @autobind
  handleCloseClick() {
    const { closeModal, log, setTerminalBusy } = this.props;
    closeModal();
    log('&nbsp;');
    setTerminalBusy(false);
  }

  render() {
    const { open, uiEnabled, cicData } = this.props;
    const { activeTab, cicDataText } = this.state;

    return (
      <Modal isOpen={open} id="cic_data_modal">
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                disabled={!uiEnabled}
                className={classnames({ active: activeTab === 'edit' })}
                onClick={this.handleEditTabClick}
              >
                Edit
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                disabled={!uiEnabled}
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
                wrapEnabled
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
          <Button disabled={!uiEnabled} color="primary" size="sm" onClick={this.handleSaveClick}>Save</Button>
          <Button disabled={!uiEnabled} color="primary" outline size="sm">Save & Close</Button>
          <Button disabled={!uiEnabled} color="secondary" outline size="sm" onClick={this.handleCloseClick}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
