import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';

import { terminalLogsSelector, terminalBusyStateSelector } from 'services/terminal';

const mapStateToProps = createStructuredSelector({
  logs: terminalLogsSelector,
  isBusy: terminalBusyStateSelector
});

@connect(mapStateToProps)
export default class Terminal extends React.Component {
  @autobind
  handleTerminalClick() {
    if (this.promptInput) {
      this.promptInput.focus();
    }
  }

  @autobind
  handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 13 && !ctrlKey && !altKey && !metaKey && !shiftKey) {

    }
  }

  render() {
    const { logs, isBusy } = this.props;

    return (
      <div className="terminal" onClick={this.handleTerminalClick}>
        {logs.map(log => <p key={shortid.generate()}>{log}</p>)}
        <br />
        {!isBusy && <input
          className="terminal__input"
          type="text"
          ref={e => { this.promptInput = e; }}
          autoFocus
          onKeyDown={this.handleKeyDown}
        />}
      </div>
    );
  }
}
