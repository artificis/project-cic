import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';
import queryString from 'query-string';

import { getAccessToken } from 'services/auth';
import {
  terminalLogsSelector, terminalBusyStateSelector,
  setTerminalBusy, spitToTerminal as log
} from 'services/terminal';
import evalCommand from './eval-command';

const promptSymbol = '313-AMT4-030>&nbsp;';

const mapStateToProps = createStructuredSelector({
  logs: terminalLogsSelector,
  isBusy: terminalBusyStateSelector
});

const mapDispatchToProps = {
  log,
  setTerminalBusy,
  getAccessToken
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Terminal extends React.Component {
  componentDidMount() {
    const qs = queryString.parse(this.props.location.search);
    if (Object.keys(qs).length > 0) {
      this.finishLogin(qs);
    }
  }

  componentDidUpdate() {
    window.scrollTo(0, this.wrapperEl.scrollHeight);
  }

  finishLogin(qs) {
    const { log, getAccessToken } = this.props;
    log('Signing in...');
    log('Looking for oauth code...');
    if (Object.keys(qs).includes('code')) {
      log('Oauth code found.');
      getAccessToken(qs.code);
    } else if (Object.keys(qs).includes('error')) {
      log('Oauth code not found!');
      log(JSON.stringify(qs));
      log('&nbsp;');
    }
  }

  @autobind
  handleTerminalClick() {
    if (this.promptInput) {
      this.promptInput.focus();
    }
  }

  @autobind
  async handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 13 && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      const { promptInput, props: { log, setTerminalBusy } } = this;
      const input = promptInput.value.trim();

      log(`${promptSymbol}${input}`);
      if (input !== '') {
        setTerminalBusy(true);
        if (evalCommand(input.toLowerCase(), log)) {
          setTerminalBusy(false);
        }
      }
      log('&nbsp;');
    }
  }

  render() {
    const { logs, isBusy } = this.props;
    const promptEl = isBusy
      ? null
      : (<div className="d-flex align-items-center">
          <div dangerouslySetInnerHTML={{ __html: promptSymbol }} />
          <input
            className="terminal__input"
            type="text"
            ref={e => { this.promptInput = e; }}
            autoFocus
            onKeyDown={this.handleKeyDown}
          />
        </div>);

    return (
      <div
        className="terminal"
        ref={e => { this.wrapperEl = e; }}
        onClick={this.handleTerminalClick}
      >
        {logs.map(log => <p key={shortid.generate()} dangerouslySetInnerHTML={{ __html: log }} />)}
        {promptEl}
      </div>
    );
  }
}
