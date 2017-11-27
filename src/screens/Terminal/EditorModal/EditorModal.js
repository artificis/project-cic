import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import autobind from 'autobind-decorator';
import {
  Modal, ModalBody, ModalFooter, Button, Input,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { modalOpenSelector, cicDataSelector, closeModal, setCicData } from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';

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
  handleCicDataTextAreaChange(e) {
    this.setState({ cicDataText: e.target.value });
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
                onClick={() => this.switchTabTo('edit')}
              >
                Edit
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'view' })}
                onClick={() => this.switchTabTo('view')}
              >
                View
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="edit" className="py-3">
              <Input
                type="textarea"
                id="cic_data"
                value={cicDataText}
                onChange={this.handleCicDataTextAreaChange}
              />
            </TabPane>
            <TabPane tabId="view" className="py-3">
              <p>Look at me</p>
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
