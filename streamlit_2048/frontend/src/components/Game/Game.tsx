import React, { useEffect, useState, useCallback } from "react"; // NEW added useState, useCallback 
import { useThrottledCallback } from "use-debounce";

import { useGame } from "./hooks/useGame";
import { Board, animationDuration, tileCount } from "../Board";



// NEW added props to pass callback, added score to return value
export const Game = (props:any) => {
  // NEW added boardChanged and score 
  const [boardChanged, score, tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  // NEW counter for moves and dictionary storage
  var [move_counter, setMoveCounter] = useState(0)
  // NEW added parentRetrieveScoreCallback callback function to update score
  props.parentRetrieveScoreCallback(score);

  // NEW function to trigger different game moves
  const handleGameMove = (e: KeyboardEvent) => {

    switch (e.code) {
      case "ArrowLeft":
        moveLeft();
        break;
      case "ArrowRight":
        moveRight();
        break;
      case "ArrowUp":
        moveUp();
        break;
      case "ArrowDown":
        moveDown();
        break;
    }

    console.log(boardChanged)
    console.log(score)
    // NEW Add test to only make a new move log entry if the board has changed (NEEDS TESTING)
    // if (boardChanged === true) {
    if (true) {
      // NEW create new_move_log_entry to send back to App
      const new_move_log_entry: any = {
        move_log_key: move_counter,
        move_log_entry: {
          score: score,
          move: `${e.code}`,
          tiles: [...tiles]
        }
      }
      // NEW send new move entry back to App
      props.parentRetrieveNewMoveLogCallback(new_move_log_entry)
      // NEW increment move_counter in the state
      setMoveCounter(move_counter + 1)
    }

    
    
    
  }
  


  // NEW throttled function for game moves that protects the reducer from being flooded with events
  const throttledGameMove = useThrottledCallback(
    handleGameMove,
    animationDuration,
    { leading: true, trailing: false }
  );
  
  // NEW callback for keydown that shifts throttling to the game move functionality only, so that preventDefault can always be called
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // disables page scrolling with keyboard arrows
    e.preventDefault();
    // Uses throttled game move
    throttledGameMove(e)
  }, [throttledGameMove])

  // NEW switched callback from throttledHandleKeyDown to normal hangleKeyDown with throttling inside
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  
  

  return <Board tiles={tiles} tileCountPerRow={tileCount} />;
};
