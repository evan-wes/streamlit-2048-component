import React, { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { Game } from "./components/Game";

import { ComponentProps, Streamlit, withStreamlitConnection } from "streamlit-component-lib";

import "./App.less";

// NEW internal counter for number of games (incremented on restart)
var session_game_number = 1
// NEW game log to get from Game component
var game_log: any = {}

/* eslint-disable react/jsx-no-target-blank */
// export const App = () => {
const App = (props: ComponentProps) => {
  useEffect(() => Streamlit.setFrameHeight());
  const [date, setDate] = useState<Date>(new Date());

  

  const handleRestart = () => {
    setDate(new Date());
    // NEW internal game counter
    session_game_number++;
  };

  // NEW Function to try to get data from Game component
  const handleCallback = (childData:any) => {
    const game_log_key = `session_game_${session_game_number}`
    game_log[game_log_key] = childData
  }

  // NEW Get player_name from props
  const { player_name } = props.args;

  // NEW test Submit button function to send data back to streamlit
  const handleSubmit = () => {
    // NEW return value to pass back to Streamlit
    const return_val = {
      name: player_name,
      react_internal_session_game_number: session_game_number,
      date: date,
      game_log: game_log
    }
    Streamlit.setComponentValue(return_val)
  };
  
//<Game key={date.toISOString()} />
  return (
    <div className="App">
      <div className="header">
        <div>
          <h1>Play 2048</h1>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      
      <Game key={date.toISOString()} parentCallback = {handleCallback} />
      
      <div className="footer">
        <div>
          <h1>View game data</h1>
        </div>
        <div>
          <Button onClick={handleSubmit}>View</Button>
        </div>
        
      </div>
    </div>
  );
};
/* eslint-enable react/jsx-no-target-blank */

// Link the component to Streamlit JS events.
export default withStreamlitConnection(App);