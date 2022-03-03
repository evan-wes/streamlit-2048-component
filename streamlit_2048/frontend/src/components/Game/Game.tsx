import React, { useEffect, useCallback } from "react"; // NEW added useCallback 
import { useThrottledCallback } from "use-debounce";

import { useGame } from "./hooks/useGame";
import { Board, animationDuration, tileCount } from "../Board";



// NEW added props to pass callback, added score to return value
export const Game = (props:any) => {
  // NEW added score and gameOver
  const [score, gameOver, tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  // console.log('TOP OF GAME')

  // NEW counter for moves and dictionary storage
  var move_counter = 0
  
  // NEW added retrieveStatusCallback callback function to update game status
  props.retrieveStatusCallback({score: score, gameOver: gameOver});

  // NEW function to create a new move entry
  const createNewMoveEntry = (e: KeyboardEvent) => {
    // NEW create new_move_log_entry to send back to App
    const new_move_log_entry: any = {
      move_log_key: move_counter,
      move_log_entry: {
        score: score,
        gameOver: gameOver,
        move: `${e.code}`,
        tiles: [...tiles]
      }
    }
    return new_move_log_entry
  }

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
    // NEW send new move entry back to App
    props.retrieveNewMoveLogCallback(createNewMoveEntry(e))
    // NEW increment move_counter
    move_counter++
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
