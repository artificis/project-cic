import React from 'react';

export default class Terminal extends React.Component {
  handleTerminalClick() {
    this.promptInput.focus();
  }

  render() {
    return (
      <div className="terminal" onClick={this.handleTerminalClick.bind(this)}>
        <input className="terminal__input" type="text" ref={e => { this.promptInput = e; }} />
      </div>
    );
  }
}
