import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './pages/Home';
import reportWebVitals from './reportWebVitals';
import GMap from './pages/GMap';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  { path: "/map", element: <GMap /> },
  { path: "*", element: <h1>404</h1> }
]);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <RouterProvider router={router} />

);

// write a component which adds browser router to the app 
// and then render it in the root element  


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
