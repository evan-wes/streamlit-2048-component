import React, { useEffect, useState } from "react"; // NEW added useState
import { useThrottledCallback } from "use-debounce";

import { useGame } from "./hooks/useGame";
import { Board, animationDuration, tileCount } from "../Board";



// NEW added props to pass callback, added score to return value
export const Game = (props:any) => {
  const [score, tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  // NEW counter for moves and dictionary storage
  var [move_counter, setMoveCounter] = useState(0)
  // NEW added parentRetrieveScoreCallback callback function to update score
  props.parentRetrieveScoreCallback(score);

  const handleKeyDown = (e: KeyboardEvent) => {
    // disables page scrolling with keyboard arrows
    e.preventDefault();
    // NEW Print out which button was pressed
    console.log(`Button pressed: ${e.code}`)
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
  };

  // protects the reducer from being flooded with events.
  const throttledHandleKeyDown = useThrottledCallback(
    handleKeyDown,
    animationDuration,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    window.addEventListener("keydown", throttledHandleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", throttledHandleKeyDown);
    };
  }, [throttledHandleKeyDown]);

  
  

  return <Board tiles={tiles} tileCountPerRow={tileCount} />;
};
