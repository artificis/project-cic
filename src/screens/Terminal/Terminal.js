import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';
import queryString from 'query-string';

import { getAccessToken } from 'services/auth';
import {
  terminalLogsSelector, terminalBusyStateSelector, terminalValuePromptModeSelector,
  resetTerminalValuePromptMode, setTerminalBusy, spitToTerminal as log
} from 'services/terminal';
import evalCommand from './eval-command';
import EditorModal from './EditorModal';
import appInfo from 'services/../../package.json';

const commandPromptSymbol = '313-AMT7-028>&nbsp;';

const mapStateToProps = createStructuredSelector({
  logs: terminalLogsSelector,
  isBusy: terminalBusyStateSelector,
  valuePromptMode: terminalValuePromptModeSelector
});

const mapDispatchToProps = {
  log,
  setTerminalBusy,
  resetTerminalValuePromptMode,
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
    if (this.commandPromptInput) {
      this.commandPromptInput.focus();
    } else if (this.valuePromptInput) {
      this.valuePromptInput.focus();
    }
  }

  @autobind
  handleInputChange(e) {
    this.setState({ inputValue: e.target.value });
  }

  @autobind
  async handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 0x0d && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      this.onPressEnter();
    } else if (keyCode === 0x43 && ctrlKey && !metaKey) {
      this.onPressCancel();
    }
  }

  onPressEnter() {
    const { inputValue } = this.state;
    const { valuePromptMode, log, setTerminalBusy, resetTerminalValuePromptMode } = this.props;

    this.setState({ inputValue: '' });

    if (valuePromptMode.on) {
      const valueDisplayText = valuePromptMode.passwordMode ? '' : inputValue.replace(/ /g, '&nbsp;');
      log(`${valuePromptMode.promptLabel}${valueDisplayText}`);
      resetTerminalValuePromptMode();
      if (typeof valuePromptMode.onConfirm === 'function') {
        valuePromptMode.onConfirm(inputValue);
      }
    } else {
      const input = inputValue.trim();
      log(`${commandPromptSymbol}${inputValue.replace(/ /g, '&nbsp;')}`);
      if (input !== '') {
        setTerminalBusy(true);
        if (evalCommand(input, log)) {
          log('&nbsp;');
          setTerminalBusy(false);
        }
      }
    }
  }

  onPressCancel() {
    const { inputValue } = this.state;
    const { valuePromptMode, log, setTerminalBusy, resetTerminalValuePromptMode } = this.props;

    this.setState({ inputValue: '' });
    const frozenText = valuePromptMode.on
      ? `${valuePromptMode.promptLabel}${valuePromptMode.passwordMode ? '' : inputValue.replace(/ /g, '&nbsp;')}`
      : `${commandPromptSymbol}${inputValue.replace(/ /g, '&nbsp;')}`;
    log(`${frozenText}^C`);
    log('&nbsp;');
    setTerminalBusy(false);
    resetTerminalValuePromptMode();
  }

  render() {
    const { logs, isBusy, valuePromptMode } = this.props;
    const commandPromptEl = isBusy || valuePromptMode.on
      ? null
      : (<div className="d-flex align-items-center">
          <p dangerouslySetInnerHTML={{ __html: commandPromptSymbol }} />
          <input
            className="terminal__input"
            type="text"
            ref={e => { this.commandPromptInput = e; }}
            autoFocus
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
          />
        </div>);
    const valuePromptEl = valuePromptMode.on
      ? (<div className="d-flex align-items-center">
          <p dangerouslySetInnerHTML={{ __html: valuePromptMode.promptLabel }} />
          <input
            className="terminal__input"
            type={valuePromptMode.passwordMode ? 'password' : 'text'}
            ref={e => { this.valuePromptInput = e; }}
            autoFocus
            autoComplete="off"
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
          />
        </div>)
      : null;

    return (
      <div
        className="terminal"
        ref={e => { this.wrapperEl = e; }}
        onClick={this.handleTerminalClick}
      >
        {logs.map(log => <p key={shortid.generate()} dangerouslySetInnerHTML={{ __html: log }} />)}
        {commandPromptEl}
        {valuePromptEl}
        <EditorModal />
      </div>
    );
  }
}
