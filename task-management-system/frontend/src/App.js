import React, { useState } from "react";
import Login from "./components/Login";
import TaskList from "./components/TaskList";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div className="app">
      {authenticated ? (
        <TaskList />
      ) : (
        <Login setAuthenticated={setAuthenticated} />
      )}
    </div>
  );
};

export default App;
