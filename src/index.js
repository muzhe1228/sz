import React from 'react';
import ReactDOM from 'react-dom';
import App from 'views/App';
import {Provider} from 'react-redux';
import {store} from 'store';
import createBrowserHistory from 'history/createBrowserHistory';
import {Router, Route} from 'react-router-dom';


export const browser = createBrowserHistory();
window.onresize = document.getElementsByTagName('html')[0].style.fontSize = (document.documentElement.clientWidth / 3.75) + 'px';
ReactDOM.render(
  <Provider store={store}>
    <Router history={browser}>
      <Route path='/' component={App}/>
    </Router>
  </Provider>,
  document.getElementById('root'));
