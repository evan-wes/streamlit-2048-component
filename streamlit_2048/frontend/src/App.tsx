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
  
  // NEW non state version of variables
  // var new_game_score: number = 0
  // var new_game_score_string:string = '0'
  // var new_game_over: boolean = false
  // var new_game_over_string:string = 'false'
  // var new_current_move_counter = 0

  // NEW Initial game status for restarting game
  const initialGameStatus: any = {
    initialScore: 0,
    initialGameOver: false,
    initialMoveCounter: 1
  }
  // NEW default move log for start of game
  const initialMoveLog: any = {
    [initialGameStatus['initialMoveCounter']]: {
      score: initialGameStatus['initialScore'],
      gameOver: initialGameStatus['initialGameOver'],
      move: 'None',
      tiles: []
    }
  }

  // NEW add game_status to state for display use
  var [game_score, setGameScore] = useState(initialGameStatus['initialScore'])
  var [game_score_string, setGameScoreString] = useState(`${initialGameStatus['initialScore']}`)
  var [game_over, setGameOver] = useState(initialGameStatus['initialGameOver'])
  var [game_over_string, setGameOverString] = useState(`${initialGameStatus['initialGameOver']}`)
  // NEW add game_counter to State to keep track of session game number
  var [game_number, setGameNumber] = useState(1)
  var [current_move_counter, setCurrentMoveCounter] = useState(initialGameStatus['initialMoveCounter'])
  
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
    console.log('Restart clicked')
    setDate(new Date());
    // NEW add move_log to game_log
    // TODO add check to skip adding log if no moves have been made
    setGameLog({
      ...game_log,
      [game_number]: move_log
    })
    // NEW increment game counter
    setGameNumber(game_number + 1);
    console.log(`game_number: ${game_number}`)
    // NEW reset game status variables to initial value
    setGameScore(initialGameStatus['initialScore'])
    setGameScoreString(`${initialGameStatus['initialScore']}`)
    setGameOver(initialGameStatus['initialGameOver'])
    setGameOverString(`${initialGameStatus['initialGameOver']}`)
    setMoveLog(initialMoveLog)
    // new_game_score = 0
    // new_game_score_string = '0'
    // new_game_over = false
    // new_game_over_string = 'false'
    console.log(`game_score: ${game_score}`)
    // console.log(`new_game_score: ${new_game_score}`)
    console.log(`game_over: ${game_over}`)
    // console.log(`new_game_over: ${new_game_over}`)
    // NEW reset move log to initial value
    
    console.log(`move_log: ${move_log}`)
  };

  // NEW Function to handle move log retrieval and update the state value
  const handleNewMoveLogEntry = (childData: any) => {
    // NEW Add new_move_log_entry to the state
    setMoveLog({
      ...move_log,
      [childData['move_log_key']]: childData['move_log_entry']
    })
    // Increment move counter for the current game
    setCurrentMoveCounter(current_move_counter + 1)
  }

  // NEW Function to handle score and game over status retrieval and update the state values
  const handleGameStatus = (childData: any) => {
    // Set status to value retrieved from Game componenet
    // console.log('in handleGameStatus')
    setGameScore(childData['score'])
    setGameScoreString(`${childData['score']}`)
    setGameOver(childData['gameOver'])
    setGameOverString(`${childData['gameOver']}`)
    // new_game_score = childData['score']
    // new_game_score_string = `${childData['score']}`
    // new_game_over = childData['gameOver']
    // new_game_over_string = `${childData['gameOver']}`
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
          <h1>Play&nbsp;2048&nbsp;&nbsp;</h1>
        </div>
        <div>
          <Button>Score: {game_score_string}<br/>Game Over: {game_over_string}</Button>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      
      <Game key={date.toISOString()} retrieveNewMoveLog = {handleNewMoveLogEntry} retrieveStatus = {handleGameStatus} move_counter = {current_move_counter}  />
      
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