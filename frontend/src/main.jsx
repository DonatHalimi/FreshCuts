import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes.jsx';
import { configureSessionExpiredHandler } from './services/apiClient.js';
import { sessionExpired } from './store/authSlice.js';
import { store } from './store/store.js';
import './styles/index.css';

configureSessionExpiredHandler(() => {
  store.dispatch(sessionExpired());
});

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);