import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { ConnectedRouter, routerMiddleware } from "connected-react-router";
import { composeWithDevTools } from "redux-devtools-extension";
import { createBrowserHistory } from "history";
import createSagaMiddleware from "redux-saga";

import rootSaga from "./root-saga";
import "./scss/base.scss";
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import createRootReducer from "./root-reducer";

const sagaMiddleware = createSagaMiddleware();
// This UI will be deployed at /MAAS/settings for now, so route everthing to that.
export const history = createBrowserHistory({
  basename: `${MAAS_config.ui.basename}/settings` // eslint-disable-line no-undef
});
const composeEnhancers = composeWithDevTools({});
const middleware = [sagaMiddleware, routerMiddleware(history)];
const enhancers = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(createRootReducer(history), enhancers);
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();