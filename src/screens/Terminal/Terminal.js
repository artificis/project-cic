import React from 'react';
import autobind from 'autobind-decorator';

export default class Terminal extends React.Component {
  @autobind
  handleTerminalClick() {
    this.promptInput.focus();
  }

  @autobind
  handleKeyDown({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) {
    if (keyCode === 13 && !ctrlKey && !altKey && !metaKey && !shiftKey) {
      alert(`You are about to run "${this.promptInput.value.toLowerCase()}"`)
    }
  }

  render() {
    return (
      <div className="terminal" onClick={this.handleTerminalClick}>
        <input
          className="terminal__input"
          type="text"
          ref={e => { this.promptInput = e; }}
          autoFocus
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
