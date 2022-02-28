import React, { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { Game } from "./components/Game";

import { ComponentProps, Streamlit, withStreamlitConnection } from "streamlit-component-lib";

import "./App.less";


/* eslint-disable react/jsx-no-target-blank */
// export const App = () => {
const App = (props: ComponentProps) => {
  useEffect(() => Streamlit.setFrameHeight());
  const [date, setDate] = useState<Date>(new Date());
  // NEW add game_score to state for display use
  var [game_score, setScore] = useState(0)
  // NEW add game_counter to State to keep track of session game number
  var [game_number, setGameNumber] = useState(1)
  // NEW default move log for start of current game
  const initialMoveLog: any = {
    0: {
      score: game_score,
      move: 'None',
      tiles: []
    }
  }
  // NEW move_log added to state with initialMoveLog as the first entry
  var [move_log, setMoveLog] = useState(initialMoveLog)
  // NEW default game log
  const initialGameLog: any = {}
  initialGameLog[game_number] = initialMoveLog
  // NEW game_log added to state with initialGameLog as the first entry
  var [game_log, setGameLog] = useState(initialGameLog)

  // NEW Get data passed from Streamlit from props
  const { player_name } = props.args;

  const handleRestart = () => {
    setDate(new Date());
    // NEW add move_log to game_log
    // const new_game_log_entry = {
    //   game_log_key: game_number,
    //   game_log_entry: move_log
    // }
    setGameLog({
      ...game_log,
      [game_number]: move_log
    })
    console.log(game_log)
    // NEW increment game counter
    setGameNumber(game_number + 1);
    // NEW reset score to zero
    setScore(0)
    // NEW reset move log to initial value
    setMoveLog(initialMoveLog)
  };

  // NEW Function to handle move log retrieval and update the state value
  const handleNewMoveLogEntry = (childData: any) => {
    // NEW Add new_move_log_entry to the state
    setMoveLog({
      ...move_log,
      [childData['move_log_key']]: childData['move_log_entry']
    })
  }

  // NEW Function to handle score retrieval and update the state value
  const handleScore = (childData: number) => {
    // Set score to value retrieved from Game componenet
    setScore(childData)
  }

  // NEW test View Game Log button function to send data back to streamlit
  const handleViewGameLog = () => {
    // NEW update game_number : move_log entry in game log
    setGameLog({
      ...game_log,
      [game_number]: move_log
    })
    // NEW return value to pass back to Streamlit
    const ret_date = new Date()
    const return_val = {
      name: player_name,
      date: ret_date.toISOString(),
      game_log: game_log
    }
    Streamlit.setComponentValue(return_val)
  };

//<Game key={date.toISOString()} />
  return (
    <div className="App">
      <div className="header">
        <div>
          <h1>Play&nbsp;2048</h1>
        </div>
        <div>
          <Button key={game_score}>Score: {game_score}</Button>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      
      <Game key={date.toISOString()} parentRetrieveNewMoveLogCallback = {handleNewMoveLogEntry} parentRetrieveScoreCallback = {handleScore}  />
      
      <div className="footer">
        <div>
          <h1>View game data</h1>
        </div>
        <div>
          <Button onClick={handleViewGameLog}>View Game Log</Button>
        </div>
        
      </div>
    </div>
  );
};
/* eslint-enable react/jsx-no-target-blank */

// NEW Link the component to Streamlit JS events.
export default withStreamlitConnection(App);