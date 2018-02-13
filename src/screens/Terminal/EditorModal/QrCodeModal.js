import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Modal, ModalBody } from 'reactstrap';
import QRCode from 'qrcode.react';
import {
  qrCodeModalOpenSelector, qrCodeModalDataSelector, closeQrCodeModal
} from 'services/qrcode-modal';
import { terminalPrimary } from 'styles/_variables.css';

const mapStateToProps = createStructuredSelector({
  open: qrCodeModalOpenSelector,
  data: qrCodeModalDataSelector
});

const mapDispatchToProps = {
  closeQrCodeModal
};

@connect(mapStateToProps, mapDispatchToProps)
export default class QrCodeModal extends React.Component {
  render() {
    const { open, data, closeQrCodeModal } = this.props;

    return (
      <Modal
        isOpen={open}
        fade={false}
        toggle={closeQrCodeModal}
        modalClassName="d-flex align-items-center"
      >
        <ModalBody
          className="d-flex justify-content-center p-4"
          style={{ backgroundColor: '#000000' }}
        >
          <QRCode
            value={data}
            size={256}
            bgColor="#000000"
            fgColor={terminalPrimary}
          />
        </ModalBody>
      </Modal>
    );
  }
}
