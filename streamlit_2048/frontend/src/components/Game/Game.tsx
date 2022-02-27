import React, { useEffect } from "react"; // NEW added useState
import { useThrottledCallback } from "use-debounce";

import { useGame } from "./hooks/useGame";
import { Board, animationDuration, tileCount } from "../Board";


// type State = {
//   game_log: {
//     move_number: number;
//     move_direction: string;
//     value_array: number[];
//   };
// }

// NEW added props to pass callback
export const Game = (props:any) => {
  const [tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  // NEW counter for moves and dictionary storage
  var move_counter = 1
  var move_log: any = {};
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // disables page scrolling with keyboard arrows
    e.preventDefault();

    // NEW start to build the game log (called move_log here)
    const move_log_key = `move_${move_counter}`
    move_log[move_log_key] = {}
    move_log[move_log_key]['direction'] = `${e.code}`
    move_log[move_log_key]['tiles'] = [...tiles]
    move_counter++
    // NEW added parentCallback
    props.parentCallback(move_log)

    console.log(move_log)

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
