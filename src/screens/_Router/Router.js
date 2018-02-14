import React from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { Route } from 'react-router-dom';
import { history } from 'store';
import Terminal from 'screens/Terminal';

export default () => pug`
  ConnectedRouter(history=history)
    div
      Route(exact path="/" component=Terminal)
`;
