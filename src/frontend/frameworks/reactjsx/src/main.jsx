import { StrictMode } from 'react';
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import App from './App';
import './index.css';
import { ROUTE_EVENTS } from "@dqiu/util-route";
import Client from '../../../client/index.js';

const client = new Client();
client.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
  client.socket.emit(ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER);
});

/**
 * Setup router that create routes sent from the server.
 * References:
 * 1. https://stackoverflow.com/questions/72376545/what-is-the-difference-between-element-attribute-and-component-attribute-in-reac
 * 2. https://reactrouter.com/en/main/utils/create-routes-from-elements
 * 3. https://reactrouter.com/en/main/upgrading/v6-data#migrating-to-routerprovider
 * 4. https://reactrouter.com/en/main/start/tutorial
 */
const router = createBrowserRouter(createRoutesFromElements(<Route path='*' Component={App} />));
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
