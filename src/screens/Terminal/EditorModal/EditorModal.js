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
  modalOpenSelector, modalUiEnabledSelector, modalModeSelector, masterKeySelector,
  modalFilePathSelector, imageBlobSelector, cicDataSelector, modalFileShaValueSelector,
  closeModal, setCicData, createFile, updateFile
} from 'services/modal';
import { currentRepositorySelector } from 'services/repo';
import { generateFileContent } from 'services/utils';
import TableView from './TableView';
import QrCodeModal from './QrCodeModal';

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
  fileShaValue: modalFileShaValueSelector,
  masterKey: masterKeySelector,
  currentRepository: currentRepositorySelector
});

const mapDispatchToProps = {
  closeModal,
  setCicData,
  createFile,
  updateFile
};

@connect(mapStateToProps, mapDispatchToProps)
export default class EditorModal extends React.Component {
  state = {
    activeTab: 'edit',
    cicDataText: ''
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open === false && nextProps.open === true) {
      this.setState({ cicDataText: JSON.stringify(nextProps.cicData, null, 2) });
    }
  }

  switchTabTo(tabId) {
    if (this.state.activeTab !== tabId) {
      this.setState({ activeTab: tabId });
    }
  }

  validateCicData() {
    try {
      const json = JSON.parse(this.state.cicDataText);
      if (Array.isArray(json)) {
        return false;
      }
      if (Object.keys(json).every(key => {
        if (!Array.isArray(json[key])) return false;
        return json[key].every(row => row.length === 5);
      })) {
        return json;
      }
      return false;
    } catch (err) {
      return false;
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
    const data = this.validateCicData();
    if (data) {
      this.props.setCicData(data);
      this.switchTabTo('view');
    } else {
      this.aceEditor.editor.focus();
      alert('Invalid JSON syntax or CIC data format');
    }
  }

  @autobind
  handleSaveClick(closeModalAfterSave = false) {
    const {
      mode, filePath, imageBlob, cicData, fileShaValue, masterKey,
      currentRepository: { resourcePath: repoResourcePath },
      setCicData, createFile, updateFile
    } = this.props;
    const { activeTab } = this.state;
    const saveFile = mode === 'create' ? createFile : updateFile;
    const extraOptions = mode === 'update' ? { sha: fileShaValue } : {};
    let data = cicData;

    if (activeTab === 'edit') {
      data = this.validateCicData();
      if (data) {
        setCicData(data);
      } else {
        this.aceEditor.editor.focus();
        alert('Invalid JSON syntax or CIC data format');
      }
    }

    if (data) {
      saveFile({
        closeModalAfterSave,
        repoResourcePath,
        filePath,
        options: {
          ...extraOptions,
          content: generateFileContent(imageBlob, data, masterKey),
          message: 'Update CIC data'
        }
      });
    }
  }

  @autobind
  handleCloseClick() {
    this.props.closeModal();
  }

  render() {
    const { open, uiEnabled } = this.props;
    const { activeTab, cicDataText } = this.state;

    return (
      <Modal isOpen={open} id="cic_data_modal" fade={false}>
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
              <TableView />
              <QrCodeModal />
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button disabled={!uiEnabled} color="primary" size="sm" onClick={() => this.handleSaveClick()}>Save</Button>
          <Button disabled={!uiEnabled} color="primary" outline size="sm" onClick={() => this.handleSaveClick(true)}>Save & Close</Button>
          <Button disabled={!uiEnabled} color="secondary" outline size="sm" onClick={this.handleCloseClick}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
