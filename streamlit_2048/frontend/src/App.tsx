import React, { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { Game } from "./components/Game";

// NEW import state for Streamlit custom components
import { ComponentProps, Streamlit, withStreamlitConnection } from "streamlit-component-lib";

import "./App.less";


/* eslint-disable react/jsx-no-target-blank */
// export const App = () => {
const App = (props: ComponentProps) => {
  // NEW dynamic effect to adjust the component frame height in the Streamlit app
  useEffect(() => Streamlit.setFrameHeight());

  // NEW Get data passed from Streamlit via props
  const { player_name } = props.args;

  // Add date variable to state. Used as key of Game component
  const [date, setDate] = useState<Date>(new Date());


  // NEW Initial game status for restarting game
  const initialGameStatus: any = {
    initialScore: 0,
    initialGameOver: false,
    initialMoveCounter: 1
  }

  // NEW default move log entry for start of game, initial key is initialGameStatus['initialMoveCounter']
  const initialMoveLogEntry: any = {
    score: initialGameStatus['initialScore'],
    gameOver: initialGameStatus['initialGameOver'],
    move: 'Initial',
    tiles: []
  }
  // NEW default move log for reseting the game
  const initialMoveLog: any = {
    [initialGameStatus['initialMoveCounter']]: initialMoveLogEntry
  }

  // NEW add game status variables to state
  var [game_score, setGameScore] = useState(initialGameStatus['initialScore'])
  var [game_over, setGameOver] = useState(initialGameStatus['initialGameOver'])
  var [move_counter, setMoveCounter] = useState(initialGameStatus['initialMoveCounter'])
  // NEW add game_counter to State to keep track of session game number
  var [game_counter, setGameCounter] = useState(1)

  
  // NEW move_log added to state with initialMoveLog as the first entry
  var [move_log, setMoveLog] = useState(initialMoveLog)
  // NEW default game log
  const initialGameLog: any = {}
  initialGameLog[game_counter] = initialMoveLog
  // NEW game_log added to state with initialGameLog as the first entry
  var [game_log, setGameLog] = useState(initialGameLog)



  // NEW function to handle restarting the game with logic to only log games with at least one move 
  const handleRestart = () => {
    console.log('')
    console.log('Restart clicked')
    console.log(`move_counter: ${move_counter}`)
    console.log(`move_log[move_counter]: ${JSON.stringify(move_log[move_counter])}`)
    
    // First check if the move_log entry for the current value of move_counter is undefined. 
    // It will only be undefined if at least one move was made, otherwise it is equal to initialMoveLogEntry
    if (move_log[move_counter] !== undefined) {
      // Here we check if the Restart button was clicked more than once in a row. If a game was logged, 
      // move_log was reset to initialMoveLog, and move_counter was reset to 1. 
      // Thus move_log[move_counter] is equal to initialMoveLogEntry.
      // We don't want to check equality directly between move_log and initialMoveLog, or between
      // move_log[move_counter] and initialMoveLogEntry since they are Objects, so we check the value of the latest
      // 'move', which is unique in initialMoveLogEntry. We need to do this check separately since we cannot access 
      // move_log[move_counter] if it is undefined
      if (move_log[move_counter]['move'] === initialMoveLogEntry['move']) {
        // If reached here, the Restart buttun has been pressed in a row. There is nothing to do.
        // TODO, show a message or something to the player telling them to go ahead and make a move?
        console.log('Game not added to game_log')
        console.log(`move_counter: ${move_counter}`)
        console.log(`move_log[move_counter]: ${JSON.stringify(move_log[move_counter])}`)
        console.log(`initialMoveLogEntry: ${JSON.stringify(initialMoveLogEntry)}`)
        console.log(`move_log: ${JSON.stringify(move_log)}`)
        console.log(`initialMoveLog: ${JSON.stringify(initialMoveLog)}`)
        // We still want to actually restart the game (i.e. generate a new starting layout)
      }
    } else {
      // If we reach here, we have a real game log to record
      // NEW add move_log to game_log
      console.log('Game added to game_log')
      setGameLog({
        ...game_log,
        [game_counter]: move_log
      })
      // NEW increment game counter
      setGameCounter(game_counter + 1)
      console.log(`game_counter: ${game_counter}`)
    }
      
    // Add new date to state for Game component key
    setDate(new Date());

    // NEW reset game status variables to initial value
    setGameScore(initialGameStatus['initialScore'])
    setGameOver(initialGameStatus['initialGameOver'])
    setMoveCounter(initialGameStatus['initialMoveCounter'])
    setMoveLog(initialMoveLog)
    console.log(`game_score: ${game_score}`)
    console.log(`game_over: ${game_over}`)
    console.log(`move_counter: ${move_counter}`)
    console.log(`move_log[move_counter]: ${JSON.stringify(move_log[move_counter])}`)
    console.log(`initialMoveLogEntry: ${JSON.stringify(initialMoveLogEntry)}`)
    console.log(`move_log: ${JSON.stringify(move_log)}`)
    console.log(`initialMoveLog: ${JSON.stringify(initialMoveLog)}`)
    
  };

  // NEW Function to handle move log retrieval and update the state value
  const handleNewMoveLogEntry = (childData: any) => {
    // NEW Add new_move_log_entry to the state
    setMoveLog({
      ...move_log,
      [childData['move_log_key']]: childData['move_log_entry']
    })
    // Increment move counter for the current game
    setMoveCounter(move_counter + 1)
  }

  // NEW Function to handle score and game over status retrieval and update the state values
  const handleGameStatus = (childData: any) => {
    // Set status to value retrieved from Game componenet
    // console.log('in handleGameStatus')
    setGameScore(childData['score'])
    setGameOver(childData['gameOver'])
  }

  // NEW View Game Log button callback function to send data back to streamlit
  const handleViewGameLog = () => {
    // NEW update game_counter : move_log entry in game log so it contains updated moves
    setGameLog({
      ...game_log,
      [game_counter]: move_log
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
          <Button>Score: {game_score}<br/>Game Over: {`${game_over}`}</Button>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      
      <Game key={date.toISOString()} retrieveNewMoveLog={handleNewMoveLogEntry} retrieveStatus={handleGameStatus} move_counter = {move_counter}  />
      
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