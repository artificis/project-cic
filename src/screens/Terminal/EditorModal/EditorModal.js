import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import autobind from 'autobind-decorator';
import AceEditor from 'react-ace';
import {
  Input, Modal, ModalBody, ModalFooter, Button,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';

import {
  modalOpenSelector, modalUiEnabledSelector, modalModeSelector, masterKeySelector,
  modalFilePathSelector, imageBlobSelector, cicDataSelector, modalFileShaValueSelector,
  searchKeywordSelector,
  setSearchKeyword, closeModal, setCicData, createFile, updateFile
} from 'services/modal';
import { currentRepositorySelector } from 'services/repo';
import { generateFileContent } from 'services/utils';
import FaqModal from './FaqModal';
import TableView from './TableView';
import QrCodeModal from './QrCodeModal';
import './EditorModal.css';

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
  searchKeyword: searchKeywordSelector,
  fileShaValue: modalFileShaValueSelector,
  masterKey: masterKeySelector,
  currentRepository: currentRepositorySelector
});

const mapDispatchToProps = {
  closeModal,
  setCicData,
  setSearchKeyword,
  createFile,
  updateFile
};

@connect(mapStateToProps, mapDispatchToProps)
export default class EditorModal extends React.Component {
  state = {
    activeTab: 'edit',
    cicDataText: '{}',
    minimized: false,
    faqModalOpen: false
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
  handleSearchFieldChange(e) {
    this.props.setSearchKeyword(e.target.value);
  }

  @autobind
  handleModalKeyDown({ metaKey, ctrlKey }) {
    if (this.state.activeTab === 'view') {
      const searchField = document.getElementById('search_field');
      if (searchField !== document.activeElement && !metaKey && !ctrlKey) {
        searchField.focus();
      }
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

  @autobind
  handleFaqButtonClick() {
    this.setState({ faqModalOpen: true });
  }

  @autobind
  handleFaqModalClose() {
    this.setState({ faqModalOpen: false });
  }

  @autobind
  handleToggleMinMaxButtonClick() {
    const { minimized } = this.state;
    const modalBody = document.getElementById('modal_body');
    const tabContent = document.getElementById('tab_content');

    if (minimized) {
      modalBody.style.height = this.modalBodyStyleHeight || '85vh';
      tabContent.style.display = 'block';
    } else {
      this.modalBodyStyleHeight = modalBody.style.height;
      modalBody.style.height = '63px';
      tabContent.style.display = 'none';
    }
    this.setState({ minimized: !minimized });
  }

  render() {
    const { open, uiEnabled } = this.props;
    const { activeTab, cicDataText, minimized, faqModalOpen } = this.state;

    return (
      <Modal isOpen={open} id="cic_data_modal" fade={false} tabIndex={1} onKeyDown={this.handleModalKeyDown}>
        <ModalBody id="modal_body">
          <Nav pills className="position-relative">
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
            <Button
              className="btn-faq"
              size="sm"
              outline
              onClick={this.handleFaqButtonClick}
            >
              ?
            </Button>
            <Button
              className="btn-toggle-min-max"
              size="sm"
              outline
              onClick={this.handleToggleMinMaxButtonClick}
            >
              {minimized ? '↧' : '↥'}
            </Button>
          </Nav>
          <TabContent activeTab={activeTab} id="tab_content">
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
            <TabPane tabId="view" className="py-3 view-tab">
              <Input
                className="search-field"
                placeholder="🔎"
                id="search_field"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                value={this.props.searchKeyword}
                onChange={this.handleSearchFieldChange}
              />
              <div className="table-wrapper"><TableView /></div>
              <QrCodeModal />
            </TabPane>
          </TabContent>
          <FaqModal isOpen={faqModalOpen} onToggle={this.handleFaqModalClose} />
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
