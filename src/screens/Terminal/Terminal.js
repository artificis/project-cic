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
import EditorModal from './EditorModal';
import appInfo from 'services/../../package.json';

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
  state = {
    inputValue: ''
  };

  componentDidMount() {
    const code = this.checkIfOAuthCallback();
    if (code) {
      window.location.replace(`/#/?code=${code}`);
    } else {
      const { location, log } = this.props;
      const qs = queryString.parse(location.search);
      if (Object.keys(qs).length > 0) {
        this.finishLogin(qs);
      } else {
        log(`Welcome to Project CIC (v${appInfo.version})`);
        log('&nbsp;');
      }
    }
  }

  componentDidUpdate() {
    window.scrollTo(0, this.wrapperEl.scrollHeight);
  }

  checkIfOAuthCallback() {
    const qs = queryString.parse(window.location.search);
    if (Object.keys(qs).includes('code')) {
      return qs.code;
    } else {
      return false;
    }
  }

  finishLogin(qs) {
    const { log, getAccessToken } = this.props;
    log('Signing in...');
    log('Looking for OAuth code...');
    if (Object.keys(qs).includes('code')) {
      log('OAuth code found');
      getAccessToken(qs.code);
    } else {
      log('OAuth code not found!');
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
  handleInputChange(e) {
    this.setState({ inputValue: e.target.value });
  }

  @autobind
  async handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 13 && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      const { state: { inputValue }, props: { log, setTerminalBusy } } = this;
      const input = inputValue.trim();

      this.setState({ inputValue: '' });
      log(`${promptSymbol}${inputValue.replace(/ /g, '&nbsp;')}`);
      if (input !== '') {
        setTerminalBusy(true);
        if (evalCommand(input, log)) {
          setTerminalBusy(false);
          log('&nbsp;');
        }
      }
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
            value={this.state.inputValue}
            onChange={this.handleInputChange}
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
        <EditorModal />
      </div>
    );
  }
}
