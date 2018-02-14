import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';
import marked from 'marked';
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
  /* eslint-disable class-methods-use-this */
  selectWholeText(e) {
    window.getSelection().selectAllChildren(e.target);
  }
  /* eslint-enable */

  handleQrCodeButtonClick(data) {
    this.props.openQrCodeModal(data);
  }

  render() {
    const { cicData } = this.props;

    return Object.keys(cicData).map(
      category => pug`
        Table.cic-data-table(
          key=shortid.generate()
          striped=true
          bordered=true
        )
          caption= category
          thead
            tr
              th Service Provider
              th Login
              th Password
              th Associated Email
              th Notes
              th
          tbody
            ${cicData[category].map(
              row => pug`
                tr(key=shortid.generate())
                  td(dangerouslySetInnerHTML={ __html: marked(row[0]) })
                  td(
                    dangerouslySetInnerHTML={ __html: marked(row[1]) }
                    onClick=this.selectWholeText
                  )
                  td(onClick=this.selectWholeText)= row[2]
                  td= row[3]
                  td(dangerouslySetInnerHTML={ __html: marked(row[4]) })
                  td
                    Button(
                      size="sm"
                      color="secondary"
                      outline=true
                      title="Show QR code"
                      onClick=${() => this.handleQrCodeButtonClick(row[2])}
                    )
                      span(role="img" aria-label="Show QR code") 📱
              `
            )}
      `
    );
  }
}
