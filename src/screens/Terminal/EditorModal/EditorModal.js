import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import autobind from 'autobind-decorator';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/solarized_light';
import 'brace/ext/searchbox';
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { generateFileContent } from 'utils/cic-contents';
import {
  modalOpenSelector,
  modalUiEnabledSelector,
  masterKeySelector,
  imageBlobSelector,
  cicDataSelector,
  searchKeywordSelector,
  setSearchKeyword,
  closeModal,
  setCicData,
  saveFile
} from 'services/modal';
import FaqModal from './FaqModal';
import TableView from './TableView';
import QrCodeModal from './QrCodeModal';
import './EditorModal.css';

const mapStateToProps = createStructuredSelector({
  open: modalOpenSelector,
  uiEnabled: modalUiEnabledSelector,
  imageBlob: imageBlobSelector,
  cicData: cicDataSelector,
  searchKeyword: searchKeywordSelector,
  masterKey: masterKeySelector
});

const mapDispatchToProps = {
  closeModal,
  setCicData,
  setSearchKeyword,
  saveFile
};

@connect(mapStateToProps, mapDispatchToProps)
export default class EditorModal extends React.Component {
  state = {
    activeTab: 'edit',
    cicDataText: '{}',
    minimized: false,
    faqModalOpen: false
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.open === false && nextProps.open === true) {
      this.setState({
        cicDataText: JSON.stringify(nextProps.cicData, null, 2)
      });
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
      if (
        Object.keys(json).every(key => {
          if (!Array.isArray(json[key])) return false;
          return json[key].every(row => row.length === 5);
        })
      ) {
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
      alert('Invalid JSON syntax or CIC data format'); // eslint-disable-line
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
    const { imageBlob, cicData, masterKey } = this.props;
    const { activeTab } = this.state;
    let data = cicData;

    if (activeTab === 'edit') {
      data = this.validateCicData();
      if (data) {
        this.props.setCicData(data);
      } else {
        this.aceEditor.editor.focus();
        alert('Invalid JSON syntax or CIC data format'); // eslint-disable-line
      }
    }

    if (data) {
      this.props.saveFile({
        closeModalAfterSave,
        content: generateFileContent(imageBlob, data, masterKey),
        message: 'Update CIC data'
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

    return pug`
      Modal#cic_data_modal(
        isOpen=open
        fade=false
        tabIndex=1
        onKeyDown=this.handleModalKeyDown
      )
        ModalBody#modal_body
          Nav.position-relative(pills)
            NavItem
              NavLink(
                disabled=!uiEnabled
                className=classnames({ active: activeTab === 'edit' })
                onClick=this.handleEditTabClick
              )
                | Edit
            NavItem
              NavLink(
                disabled=!uiEnabled
                className=classnames({ active: activeTab === 'view' })
                onClick=this.handleViewTabClick
              )
                | View
            Button.btn-faq(
              size="sm"
              outline=true
              onClick=this.handleFaqButtonClick
            )
              | ?
            Button.btn-toggle-min-max(
              size="sm"
              outline=true
              onClick=this.handleToggleMinMaxButtonClick
            )
              ${minimized ? '↧' : '↥'}
          TabContent#tab_content(activeTab=activeTab)
            TabPane.py-3(tabId="edit")
              AceEditor(
                mode="json"
                theme="solarized_light"
                value=cicDataText
                tabSize=2
                showPrintMargin=false
                width="100%"
                height="100%"
                wrapEnabled=true
                ref=${e => {
                  this.aceEditor = e;
                }}
                onChange=this.handleAceEditorChange
              )
            TabPane.py-3.view-tab(tabId="view")
              Input.search-field#search_field(
                placeholder="🔎"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                value=this.props.searchKeyword
                onChange=this.handleSearchFieldChange
              )
              .table-wrapper
                TableView
              QrCodeModal
          FaqModal(isOpen=faqModalOpen onToggle=this.handleFaqModalClose)
        ModalFooter
          Button(
            disabled=!uiEnabled
            color="primary"
            size="sm"
            onClick=${() => this.handleSaveClick()}
          )
            | Save
          Button(
            disabled=!uiEnabled
            color="primary"
            outline=true
            size="sm"
            onClick=${() => this.handleSaveClick(true)}
          )
            | Save & Close
          Button(
            disabled=!uiEnabled
            color="secondary"
            outline=true
            size="sm"
            onClick=this.handleCloseClick
          )
            | Close
    `;
  }
}
