import { useEffect, useState, useRef, Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BUILT_IN_SOCKET_EVENTS } from "@dqiu/util-event";
import { ROUTE_EVENTS } from "@dqiu/util-route";
import Client from "../../../client/index.js";

/**
 * @template T
 * @typedef {[T, React.Dispatch<React.SetStateAction<T>>]} ReactState
 */
/**
 * @typedef {import("@dqiu/util-event").FrameworkSideEvent} FrameworkSideEvent
 */

/**
 * Client is moved outside App to remove eslint rule 'react-hooks/exhaustive-deps'. Ref: https://stackoverflow.com/a/58959607
 */
const client = new Client();
client.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
  client.socket.emit(ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER);
});
// move client to main.jsx

// TODO: move route events to route apis in server.

/**
 * References:
 * 1. https://reactrouter.com/en/main/route/route#layout-routes
 */
function Layout() {

}

/**
 * State information resets on every re-render. Ref information persists re-render.
 * References:
 * 1. https://socket.io/how-to/use-with-react
 */
function App() {
  /**
   * @type {ReactState<FrameworkSideRoutes[]>}
   */
  const [routes, setRoutes] = useState([]);
  const isConnected = useRef(false);

  const [count, setCount] = useState(0);

  // const [successMessage, setSuccessMessage] = useState("");
  // const [warningMessage, setWarningMessage] = useState("")
  // const [errorMessage, setErrorMessage] = useState("");

  const disconnect = () => isConnected.current = false;
  const connectSocketToIo = () => isConnected.current = true;
  /**
   * 
   * @param {FrameworkSideRoutes[]} routes 
   * @returns 
   */
  const setupRoutes = (routes) => {
    
  };

  // load events/routes here
  // if not connected and events.size === 0 show loading screen. If connected, load routes/events
  // if disconnected and events.size !== 0 we should still be able to mantain frontend. Display warning saying server is not connected and cannot receive updates from server.
  // test what happens when server disconnects in framework

  // useEffect(() => {
  //   // everything is re-running every time I navigate to another route. That's not supposed to happen. It's a one time occurrence.
  //   client.socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
  //   client.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
  //   client.socket.on(ROUTE_EVENTS.ROUTE, setupRoutes);
  //   return () => {
  //     client.socket.off(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
  //     client.socket.off(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
  //     client.socket.off(ROUTE_EVENTS.ROUTE, setupRoutes);
  //   };
  // }, []);
  useEffect(() => {
    // note that console message appears twice without turning off route response.
    // turning off route response makes sure routes are mounted once and not twice.
    client.socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
    client.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
    client.listenToRouteResponse(setupRoutes);
    return () => {
      client.socket.off(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
      client.socket.off(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
      client.turnOffRouteResponse(setupRoutes);
    };
  }, []);
  return (
    <Routes>
      {routes.map((r, index) => {
        return (
          <Route key={index} path={r.route} element={<h1>{r.route}</h1>} />
        );
      })}
    </Routes>
  );

  // return (
  //   <>
  //     {routes.length === 0 ?
  //         <h1>Server is loading. Please wait...</h1>
  //       :
  //       // load routes here
  //         // <Fragment>
  //         //   {!isConnected &&
  //         //     <h1>Client: Server disconnected.</h1>
  //         //   }
  //         //   <h1>Routes: {routes.map(r => r.route).join(", ")}</h1>
  //         // </Fragment>
      
  //     }
  //   </>
  // );

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
}

export default App;
