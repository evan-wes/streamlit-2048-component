import React, { useEffect, useCallback } from "react"; // NEW added useCallback 
import { useThrottledCallback } from "use-debounce";

import { useGame } from "./hooks/useGame";
import { Board, animationDuration, tileCount } from "../Board";

// NEW variable to hold the gameOver status, initialized outside of useGame hook
var gameOver: boolean = false

// NEW added props to pass callback, added score to return value
export const Game = (props:any) => {
  // NEW added score
  const [score, tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  // NEW function to build a tile value array for diagnosis
  const createTileValueArray = useCallback((verbose=false) => {
    // Create array filled with zeros
    var currentTileValues = new Array(tileCount * tileCount).fill(0)
    tiles.forEach((tile) => {
      const tileValueIndex = tile.position[1] * tileCount + tile.position[0]
      currentTileValues[tileValueIndex] = tile.value
      // console.log(`position: (${tile.position[0]}, ${tile.position[1]}), value: ${tile.value}`)
    });
    if (verbose === true){
      console.log('Current tile values:')
      for (
        let ii = 0;
        ii < tileCount;
        ii += 1
      ){
        console.log(`${currentTileValues.slice(ii*tileCount, (ii+1)*tileCount)}`)
      }
    }
    return currentTileValues;
  }, [tiles]);

  // NEW function to check the game over status whenever the board changes
  const checkGameOver = useCallback((): boolean => {
    // Get 1D array of current tile values
    const tileValueArray = createTileValueArray();
    // If there are any values of zero, the game is not over
    if (tileValueArray.includes(0)) { return false }
    // Determine if there are any available merges
    // Modified copies of tile retrieval functions from move factories in useGame hook
    const retrieveTileValuesByRow = (tileValues: number[], rowIndex: number) => { 
      const tileValuesInRow = [
        tileValues[rowIndex * tileCount + 0],
        tileValues[rowIndex * tileCount + 1],
        tileValues[rowIndex * tileCount + 2],
        tileValues[rowIndex * tileCount + 3],
      ];
      return tileValuesInRow;
    };
    const retrieveTileValuesByColumn = (tileValues: number[], columnIndex: number) => {  
      const tileValuesInColumn = [
        tileValues[columnIndex + tileCount * 0],
        tileValues[columnIndex + tileCount * 1],
        tileValues[columnIndex + tileCount * 2],
        tileValues[columnIndex + tileCount * 3],
      ];
      return tileValuesInColumn;
    };
    // iterates through every row and column and checks for available merges
    for (
      let rowOrColumnIndex = 0;
      rowOrColumnIndex < tileCount;
      rowOrColumnIndex += 1
    ) {
      console.log(`Checking Row and Column index: ${rowOrColumnIndex}`)
      // retrieves tiles in this row and column
      const rowTileValues = retrieveTileValuesByRow(tileValueArray, rowOrColumnIndex);
      const columnTileValues = retrieveTileValuesByColumn(tileValueArray, rowOrColumnIndex);
      console.log(`Retrieved rowTileValues: ${rowTileValues} and columnTileValues: ${columnTileValues}`)

      // interate through tiles in this row and column and check for duplicates
      for (
        let rowOrColumnInnerIndex = 0;
        rowOrColumnInnerIndex < tileCount-1;
        rowOrColumnInnerIndex += 1
      ){
        const thisRowValue = rowTileValues[rowOrColumnInnerIndex]
        const nextRowValue = rowTileValues[rowOrColumnInnerIndex+1]
        const thisColumnValue = columnTileValues[rowOrColumnInnerIndex]
        const nextColumnValue = columnTileValues[rowOrColumnInnerIndex+1]

        console.log(`Checking Row tile pairs: ${thisRowValue} and ${nextRowValue}`)
        // Check adjacent tiles in row
        if (thisRowValue === nextRowValue){
          console.log('Row check: Returning false')
          return false
        }
        console.log(`Checking Column tile pairs: ${thisColumnValue} and ${nextColumnValue}`)
        // Check adjacent tiles in column
        if (thisColumnValue === nextColumnValue){
          console.log('Column check: Returning false')
          return false
        }
      }
    }
    // If we reach here, we have checked all rows and columns for available merges and did not find any, thus the game is over
    console.log('Returning true')
    return true
  }, [createTileValueArray])

  // NEW function to create a new move entry
  const createNewMoveEntry = useCallback((move: string) => {
    // NEW create new_move_log_entry to send back to App
    // if (gameOver === true) {move = 'None'}
    const new_move_log_entry: any = {
      move_log_key: props.move_counter,
      move_log_entry: {
        score: score,
        gameOver: gameOver,
        move: move,
        tiles: [...tiles]
      }
    }
    // return new_move_log_entry
    props.retrieveNewMoveLog(new_move_log_entry)
  }, [score, tiles, props])

  // NEW function to create new game status 
  const createNewGameStatus = useCallback((score: number, gameOver: boolean) => {
    // NEW create new_game_status to send back to App
    const new_game_status: any = {
      score: score, 
      gameOver: gameOver
    }
    props.retrieveStatus(new_game_status)
  }, [props])

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
    // Check the game over status after this move to update gameOver before creating the new move log entry
    gameOver = checkGameOver()
    createNewGameStatus(score, gameOver)
    createNewMoveEntry(e.code)
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
  
  // NEW useEffect to check game over when the tiles change, included a new tile added after a move
  useEffect(() => {
    const new_gameOver = checkGameOver()
    createNewGameStatus(score, new_gameOver)
  }, [score, tiles, checkGameOver, createNewGameStatus])

  return <Board tiles={tiles} tileCountPerRow={tileCount} />;
};
