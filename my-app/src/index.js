
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Services from './components/Services';
import Appointment from './components/services/Appointment';
import EHealth from './components/services/EHealth';
import Medicine from './components/services/Medicine';

const router = createBrowserRouter([
    {
        path:'/',
        element: <App />
    },
    {
        path:"/services",
        element: <Services />
    },
    {
        path: "/services/EHealth",
        element: <EHealth />
    },
    {
        path: "/services/Appointment",
        element: <Appointment />
    },
    {
        path: "/services/Medicine",
        element: <Medicine />
    }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
