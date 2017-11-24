import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';

import {
  terminalLogsSelector, terminalBusyStateSelector,
  spitToTerminal, setTerminalBusy
} from 'services/terminal';
import evalCommand from './eval-command';

const mapStateToProps = createStructuredSelector({
  logs: terminalLogsSelector,
  isBusy: terminalBusyStateSelector
});

const mapDispatchToProps = {
  spitToTerminal,
  setTerminalBusy
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Terminal extends React.Component {
  @autobind
  handleTerminalClick() {
    if (this.promptInput) {
      this.promptInput.focus();
    }
  }

  @autobind
  async handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 13 && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      const { promptInput, props: { spitToTerminal, setTerminalBusy } } = this;
      const input = promptInput.value.trim().toLowerCase();

      spitToTerminal(`${input}&nbsp;`);
      setTerminalBusy(true);
      await evalCommand(input, spitToTerminal);
      spitToTerminal('&nbsp;');
      setTerminalBusy(false);
    }
  }

  render() {
    const { logs, isBusy } = this.props;

    return (
      <div className="terminal" onClick={this.handleTerminalClick}>
        {logs.map(log => <p key={shortid.generate()} dangerouslySetInnerHTML={{ __html: log }} />)}
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
