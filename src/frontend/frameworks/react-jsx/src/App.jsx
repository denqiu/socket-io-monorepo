import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BUILT_IN_SOCKET_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import Client from "../../../client/index.js";
import { TestEvents } from "../../../../backend/index.js";

/**
 * @template T
 * @typedef {[T, React.Dispatch<React.SetStateAction<T>>]} ReactState
 */

/**
 * @typedef {import("@dqiu/util-route").RouteProps} RouteProps
 */

function App() {
  /**
   * @type {ReactState<RouteProps[]>}
   */
  const [routes, setRoutes] = useState([]);
  const [isConnected, setConnected] = useState(false);
  const [count, setCount] = useState(0);

  // const [successMessage, setSuccessMessage] = useState("");
  // const [warningMessage, setWarningMessage] = useState("")
  // const [errorMessage, setErrorMessage] = useState("");

  const eventIds = routes.flatMap(r => r.eventBuilder.eventIds);
  const client = new Client(eventIds, {
    [MESSAGING_EVENTS.SUCCESS]: (response) => setSuccessMessage(`[Success] ${response}`),
    [MESSAGING_EVENTS.WARNING]: (warning) => setWarningMessage(`[Warning] ${warning}`),
    [MESSAGING_EVENTS.ERROR]: (error) => setError(`[Error] ${error}`)
  });

  useEffect(() => {
    function connectSocketToIo() {
      setConnected(true);
      setRoutes(TestEvents('framework').routes);
      // load events/routes here
      // if not connected and events.size === 0 show loading screen. If connected, load routes/events
      // if disconnected and events.size !== 0 we should still be able to mantain frontend. Display warning saying server is not connected and cannot receive updates from server.
      // test what happens when server disconnects in framework
    }

    function disconnect() {
      setConnected(false);
    }

    client.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
    client.socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
    client.listenToEventResponses();
    return () => {
      client.socket.off(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, connectSocketToIo);
      client.socket.off(BUILT_IN_SOCKET_EVENTS.disconnect, disconnect);
      client.removeEventResponses();
    };
  }, []);
  return (
    <>
      {routes.length === 0 ?
          <h1>Loading...</h1>
        :
        // load routes here
          <h1>Total Routes: {routes.length}</h1>
      }
    </>
  );
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
