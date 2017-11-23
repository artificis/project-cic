import React from 'react';
import autobind from 'autobind-decorator';

export default class Terminal extends React.Component {
  @autobind
  handleTerminalClick() {
    this.promptInput.focus();
  }

  render() {
    return (
      <div className="terminal" onClick={this.handleTerminalClick}>
        <input className="terminal__input" type="text" ref={e => { this.promptInput = e; }} />
      </div>
    );
  }
}
