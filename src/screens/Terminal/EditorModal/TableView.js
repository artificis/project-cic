import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';
import { markdown } from 'markdown';
import { Table, Button } from 'reactstrap';
import { filteredCicDataSelector } from 'services/modal';
import { openQrCodeModal } from 'services/qrcode-modal';

const mapStateToProps = createStructuredSelector({
  cicData: filteredCicDataSelector
});

const mapDispatchToProps = {
  openQrCodeModal
};

@connect(mapStateToProps, mapDispatchToProps)
export default class TableView extends React.Component {
  selectWholeText(e) {
    window.getSelection().selectAllChildren(e.target);
  }

  handleQrCodeButtonClick(data) {
    this.props.openQrCodeModal(data);
  }

  render() {
    const { cicData } = this.props;

    return Object.keys(cicData).map(category => (
      <Table key={shortid.generate()} striped bordered className="cic-data-table">
        <caption>{category}</caption>
        <thead>
          <tr>
            <th>Service Provider</th>
            <th>Login</th>
            <th>Password</th>
            <th>Associated Email</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cicData[category].map(row => (
            <tr key={shortid.generate()}>
              <td dangerouslySetInnerHTML={{ __html: markdown.toHTML(row[0]) }} />
              <td
                dangerouslySetInnerHTML={{ __html: markdown.toHTML(row[1]) }}
                onClick={this.selectWholeText}
              />
              <td onClick={this.selectWholeText}>{row[2]}</td>
              <td>{row[3]}</td>
              <td dangerouslySetInnerHTML={{ __html: markdown.toHTML(row[4]) }} />
              <td>
                <Button
                  size="sm"
                  color="secondary"
                  outline
                  title="Show QR code"
                  onClick={() => this.handleQrCodeButtonClick(row[2])}
                >
                  <span role="img" aria-label="Show QR code">📱</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    ));
  }
}
