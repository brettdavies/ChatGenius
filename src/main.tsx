import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import './index.css';

import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import Auth0ProviderWithNavigate from './App';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <Auth0ProviderWithNavigate>
          <RootLayout />
        </Auth0ProviderWithNavigate>
      }
      errorElement={<ErrorPage />}
    >
      <Route index element={<Home />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
