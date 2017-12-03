import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import shortid from 'shortid';
import queryString from 'query-string';

import { getLatestAppVersion } from 'services/utils';
import { getAccessToken } from 'services/auth';
import {
  terminalLogsSelector, terminalBusyStateSelector, terminalValuePromptModeSelector,
  resetTerminalValuePromptMode, setTerminalBusy, spitToTerminal as log
} from 'services/terminal';
import evalCommand from './eval-command';
import EditorModal from './EditorModal';
import appInfo from 'services/../../package.json';

const VK_ENTER = 0x0d;
const VK_C = 0x43;
const VK_ARROW_LEFT = 0x25;
const VK_ARROW_TOP = 0x26;
const VK_ARROW_RIGHT = 0x27;
const VK_ARROW_BOTTOM = 0x28;
const VK_HOME = 0x24;
const VK_END = 0x23;
const commandPromptSymbol = '313-AMT7-028>&nbsp;';
const charactersWithShiftKey = {
  [VK_ARROW_LEFT]: 'D',
  [VK_ARROW_TOP]: 'A',
  [VK_ARROW_RIGHT]: 'C',
  [VK_ARROW_BOTTOM]: 'B',
  [VK_HOME]: 'H',
  [VK_END]: 'F'
};

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

  async componentDidMount() {
    const { location, log } = this.props;
    const qs = queryString.parse(location.search);
    if (Object.keys(qs).length > 0) {
      this.finishLogin(qs);
    } else {
      await this.checkNewVersion();
      log(`Welcome to Project CIC (v${appInfo.version})`);
      log('&nbsp;');
    }

    setTimeout(() => {
      if (this.caret) {
        this.caret.style.left = `${this.promptLabel.offsetWidth + this.cmdInputShadow.offsetWidth}px`;
      }
    }, 1);
  }

  componentDidUpdate(prevProps, prevState) {
    const promptInputRef = this.props.valuePromptMode.on ? 'valuePromptInput' : 'commandPromptInput';
    if (
      this[promptInputRef] &&
      (prevState.inputValue !== this.state.inputValue || (prevProps.isBusy && !this.props.isBusy))
    ) {
      this.updateUnderscoreCaret(this[promptInputRef].selectionStart);
    }
    window.scrollTo(0, this.wrapperEl.scrollHeight);
  }

  updateUnderscoreCaret(position) {
    this.cmdInputShadow.innerHTML = this.state.inputValue.substr(0, position).replace(/ /g, '&nbsp;');
    this.caret.style.left = `${this.promptLabel.offsetWidth + this.cmdInputShadow.offsetWidth}px`;
  }

  async checkNewVersion() {
    const { setTerminalBusy, log } = this.props;
    setTerminalBusy(true);
    log('Checking for updates...');

    const latestVersion = await getLatestAppVersion();
    if (latestVersion === `v${appInfo.version}`) {
      log('You are using the latest version.');
    } else {
      log(`Project CIC ${latestVersion} is now available.`);
      log(`You have v${appInfo.version}.`);
      log('Please update by reloading this page. If it does not update after reloading the page, please try again after a few minutes.');
    }

    log('&nbsp;');
    setTerminalBusy(false);
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
  handleInputChange({ target: { value } }) {
    this.setState({ inputValue: value });
  }

  @autobind
  handleKeyDown(e) {
    const { target, keyCode, ctrlKey, altKey, metaKey, shiftKey } = e;
    const { inputValue } = this.state;

    if (keyCode === VK_ENTER && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      this.onPressEnter();
    } else if (keyCode === VK_C && ctrlKey && !metaKey) {
      this.onPressCancel();
    } else if (Object.keys(charactersWithShiftKey).includes(keyCode.toString()) && shiftKey) {
      const caretPos = target.selectionStart;
      const inputValueChars = inputValue.split('');
      inputValueChars.splice(caretPos, 0, charactersWithShiftKey[keyCode]);
      this.setState({ inputValue: inputValueChars.join('') });
      setTimeout(() => {
        target.selectionStart = caretPos + 1;
        target.selectionEnd = caretPos + 1;
        this.updateUnderscoreCaret(caretPos + 1);
      }, 1);
      e.preventDefault();
    } else if (keyCode === VK_ARROW_LEFT) {
      this.updateUnderscoreCaret(target.selectionStart - 1);
    } else if (keyCode === VK_ARROW_RIGHT) {
      this.updateUnderscoreCaret(target.selectionStart + 1);
    } else if (keyCode === VK_HOME) {
      this.updateUnderscoreCaret(0);
    } else if (keyCode === VK_END) {
      this.updateUnderscoreCaret(inputValue.length);
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

  getPromptComponent(isValuePrompt = false) {
    const { valuePromptMode } = this.props;
    let promptLabel = commandPromptSymbol;
    let inputType = 'text';
    let refName = 'commandPromptInput';

    if (isValuePrompt) {
      promptLabel = valuePromptMode.promptLabel;
      inputType = valuePromptMode.passwordMode ? 'password' : 'text';
      refName = 'valuePromptInput';
    }

    return (
      <div className="position-relative d-flex align-items-center">
        <p
          dangerouslySetInnerHTML={{ __html: promptLabel }}
          ref={e => { this.promptLabel = e; }}
        />
        <p className="invisible position-absolute" ref={e => { this.cmdInputShadow = e; }} />
        <input
          className="terminal__input"
          type={inputType}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          ref={e => { this[refName] = e; }}
          value={this.state.inputValue}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
        />
        <span
          className="position-absolute terminal__caret"
          ref={e => { this.caret = e; }}
        >
          <span>_</span>
        </span>
        <p className="position-absolute w-100">&nbsp;</p>
      </div>
    );
  }

  render() {
    const { logs, isBusy, valuePromptMode } = this.props;
    const commandPromptEl = isBusy || valuePromptMode.on ? null : this.getPromptComponent();
    const valuePromptEl = valuePromptMode.on ? this.getPromptComponent(true) : null;

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
