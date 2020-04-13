import { Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';
import rootReducer, { AppState, combineInitialState } from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8111 });

const bindMiddleware = (middleware: any) => {
  if (process.env.NODE_ENV !== 'production') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      collapsed: true,
    });
    middleware = [...middleware, logger];
  }
  return composeEnhancers(applyMiddleware(...middleware));
};

export function configureStore(initialState: Partial<AppState> = combineInitialState) {
  const store: Store<AppState> = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware]),
  );

  sagaMiddleware.run(rootSaga);

  return { store, persistor: null };
}
