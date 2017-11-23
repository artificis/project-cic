import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import registerServiceWorker from 'registerServiceWorker';
import store from 'store';
import Router from 'screens/router';
import 'styles/application.scss';

const App = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
