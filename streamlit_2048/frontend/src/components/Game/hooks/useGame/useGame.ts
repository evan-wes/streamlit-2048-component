import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  animationDuration,
  tileCount as tileCountPerRowOrColumn,
} from "../../../Board";
import { TileMeta } from "../../../Tile";
import { useIds } from "../useIds";
import { GameReducer, initialState } from "./reducer";

// NEW variable to hold the current game score, initialized outside of useGame hook
var gameScore: number = 0
// NEW variable to hold the gameOver status, initialized outside of useGame hook
var gameOver: boolean = false

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();
  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { tiles, byIds, hasChanged, inMotion } = state;
   

  const createTile = useCallback(
    ({ position, value }: Partial<TileMeta>) => {
      const tile = {
        id: nextId(),
        position,
        value,
      } as TileMeta;
      dispatch({ type: "CREATE_TILE", tile });
    },
    [nextId]
  );

  const mergeTile = (source: TileMeta, destination: TileMeta) => {
    dispatch({ type: "MERGE_TILE", source, destination });
  };

  // A must-have to keep the sliding animation if the action merges tiles together.
  const throttledMergeTile = (source: TileMeta, destination: TileMeta) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const updateTile = (tile: TileMeta) => {
    dispatch({ type: "UPDATE_TILE", tile });
  };

  const didTileMove = (source: TileMeta, destination: TileMeta) => {
    const hasXChanged = source.position[0] !== destination.position[0];
    const hasYChanged = source.position[1] !== destination.position[1];

    return hasXChanged || hasYChanged;
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(
      tileCountPerRowOrColumn * tileCountPerRowOrColumn
    ).fill(0) as number[];

    byIds.forEach((id) => {
      const { position } = tiles[id];
      const index = positionToIndex(position);
      tileMap[index] = id;
    });

    return tileMap;
  }, [byIds, tiles]);

  const findEmptyTiles = useCallback(() => {
    const tileMap = retrieveTileMap();

    const emptyTiles = tileMap.reduce((result, tileId, index) => {
      if (tileId === 0) {
        return [...result, indexToPosition(index) as [number, number]];
      }

      return result;
    }, [] as [number, number][]);

    return emptyTiles;
  }, [retrieveTileMap]);

  // NEW function to check if the game is over
  const checkGameOver = () => {
    const emptyTiles = findEmptyTiles();
    // If there are any empty tiles, the game is not over
    if (emptyTiles.length > 0) {
      return false
    } else {
      // Determine if there are any available merges
      // Modified copies of tile retrieval functions from move factories
      const retrieveTileIdsByRow = (tileMap: number[], rowIndex: number) => { 
        const tileIdsInRow = [
          tileMap[rowIndex * tileCountPerRowOrColumn + 0],
          tileMap[rowIndex * tileCountPerRowOrColumn + 1],
          tileMap[rowIndex * tileCountPerRowOrColumn + 2],
          tileMap[rowIndex * tileCountPerRowOrColumn + 3],
        ];
        return tileIdsInRow;
      };
      const retrieveTileIdsByColumn = (tileMap: number[], columnIndex: number) => {  
        const tileIdsInColumn = [
          tileMap[columnIndex + tileCountPerRowOrColumn * 0],
          tileMap[columnIndex + tileCountPerRowOrColumn * 1],
          tileMap[columnIndex + tileCountPerRowOrColumn * 2],
          tileMap[columnIndex + tileCountPerRowOrColumn * 3],
        ];
        return tileIdsInColumn;
      };

      // Get current tile map
      const currentTileMap = retrieveTileMap();
      // iterates through every row and check for available merges (mimics logic in move function)
      for (
        let rowOrColumnIndex = 0;
        rowOrColumnIndex < tileCountPerRowOrColumn;
        rowOrColumnIndex += 1
      ) {
        // retrieves tiles in the row or column.
        const availableTileIds = retrieveTileIdsByRow(currentTileMap, rowOrColumnIndex);

        // previousTile is used to determine if tile can be merged with the current tile.
        let previousTile: TileMeta | undefined;

        // interate through available tiles.
        availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
          const currentTile = tiles[tileId];

          // if previous tile has the same value as the current one they can be merged together and game is not over yet
          if (
            previousTile !== undefined &&
            previousTile.value === currentTile.value
          ) {
            return false
          }
        });
      }
      // iterates through every column and check for available merges (mimics logic in move function)
      for (
        let rowOrColumnIndex = 0;
        rowOrColumnIndex < tileCountPerRowOrColumn;
        rowOrColumnIndex += 1
      ) {
        // retrieves tiles in the row or column.
        const availableTileIds = retrieveTileIdsByColumn(currentTileMap, rowOrColumnIndex);

        // previousTile is used to determine if tile can be merged with the current tile.
        let previousTile: TileMeta | undefined;

        // interate through available tiles.
        availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
          const currentTile = tiles[tileId];

          // if previous tile has the same value as the current one they can be merged together and game is not over yet
          if (
            previousTile !== undefined &&
            previousTile.value === currentTile.value
          ) {
            return false
          }
        });
      }
      // If we reach here, we have checked all rows and columns for available merges and did not find any, thus the game is over
      return true
    }
  }

  const generateRandomTile = useCallback(() => {
    const emptyTiles = findEmptyTiles();

    if (emptyTiles.length > 0) {
      const index = Math.floor(Math.random() * emptyTiles.length);
      const position = emptyTiles[index];
      // NEW replace always creating a new tile with value 2 by logic to choose a value of 2 or 4 with different probabilities
      // createTile({ position, value: 2 });
      // NEW logic to pick either a value of 2 with 95% chance or a 4 with 5% chance
      const twos = new Array(19).fill(2);
      const fours = new Array(1).fill(4);
      const newValues = twos.concat(fours);
      const randomIndex = Math.floor(Math.random() * newValues.length);
      const newTileValue = newValues[randomIndex]
      createTile({ position, value: newTileValue });  
    }
  }, [findEmptyTiles, createTile]);

  const positionToIndex = (position: [number, number]) => {
    return position[1] * tileCountPerRowOrColumn + position[0];
  };

  const indexToPosition = (index: number) => {
    const x = index % tileCountPerRowOrColumn;
    const y = Math.floor(index / tileCountPerRowOrColumn);
    return [x, y];
  };

  type RetrieveTileIdsPerRowOrColumn = (rowOrColumnIndex: number) => number[];

  type CalculateTileIndex = (
    tileIndex: number,
    tileInRowIndex: number,
    howManyMerges: number,
    maxIndexInRow: number
  ) => number;

  // NEW function to increment the game score
  const incrementScore = (inc: number) => {
    gameScore += inc
  }

  const move = (
    retrieveTileIdsPerRowOrColumn: RetrieveTileIdsPerRowOrColumn,
    calculateFirstFreeIndex: CalculateTileIndex
  ) => {
    // new tiles cannot be created during motion.
    dispatch({ type: "START_MOVE" });

    const maxIndex = tileCountPerRowOrColumn - 1;

    // iterates through every row or column (depends on move kind - vertical or horizontal).
    for (
      let rowOrColumnIndex = 0;
      rowOrColumnIndex < tileCountPerRowOrColumn;
      rowOrColumnIndex += 1
    ) {
      // retrieves tiles in the row or column.
      const availableTileIds = retrieveTileIdsPerRowOrColumn(rowOrColumnIndex);

      // previousTile is used to determine if tile can be merged with the current tile.
      let previousTile: TileMeta | undefined;
      // mergeCount helps to fill gaps created by tile merges - two tiles become one.
      let mergedTilesCount = 0;

      // interate through available tiles.
      availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
        const currentTile = tiles[tileId];

        // if previous tile has the same value as the current one they should be merged together.
        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          // delays the merge by 250ms, so the sliding animation can be completed.
          throttledMergeTile(tile, previousTile);
          // NEW Since tiles were merged, increment game score with sum of merged tile values
          incrementScore(tile.value + previousTile.value);
          // previous tile must be cleared as a single tile can be merged only once per move.
          previousTile = undefined;
          // increment the merged counter to correct position for the consecutive tiles to get rid of gaps
          mergedTilesCount += 1;
          
          return updateTile(tile);
        }

        // else - previous and current tiles are different - move the tile to the first free space.
        const tile = {
          ...currentTile,
          position: indexToPosition(
            calculateFirstFreeIndex(
              rowOrColumnIndex,
              nonEmptyTileIndex,
              mergedTilesCount,
              maxIndex
            )
          ),
        } as TileMeta;

        // previous tile become the current tile to check if the next tile can be merged with this one.
        previousTile = tile;

        // only if tile has changed its position it will be updated
        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }
    // NEW Check game over status
    gameOver = checkGameOver()

    // wait until the end of all animations.
    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  const moveLeftFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * tileCountPerRowOrColumn + 0],
        tileMap[rowIndex * tileCountPerRowOrColumn + 1],
        tileMap[rowIndex * tileCountPerRowOrColumn + 2],
        tileMap[rowIndex * tileCountPerRowOrColumn + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      howManyMerges: number,
      _: number
    ) => {
      return (
        tileIndex * tileCountPerRowOrColumn + tileInRowIndex - howManyMerges
      );
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveRightFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * tileCountPerRowOrColumn + 0],
        tileMap[rowIndex * tileCountPerRowOrColumn + 1],
        tileMap[rowIndex * tileCountPerRowOrColumn + 2],
        tileMap[rowIndex * tileCountPerRowOrColumn + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      howManyMerges: number,
      maxIndexInRow: number
    ) => {
      return (
        tileIndex * tileCountPerRowOrColumn +
        maxIndexInRow +
        howManyMerges -
        tileInRowIndex
      );
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveUpFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + tileCountPerRowOrColumn * 0],
        tileMap[columnIndex + tileCountPerRowOrColumn * 1],
        tileMap[columnIndex + tileCountPerRowOrColumn * 2],
        tileMap[columnIndex + tileCountPerRowOrColumn * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      howManyMerges: number,
      _: number
    ) => {
      return (
        tileIndex +
        tileCountPerRowOrColumn * (tileInColumnIndex - howManyMerges)
      );
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  const moveDownFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + tileCountPerRowOrColumn * 0],
        tileMap[columnIndex + tileCountPerRowOrColumn * 1],
        tileMap[columnIndex + tileCountPerRowOrColumn * 2],
        tileMap[columnIndex + tileCountPerRowOrColumn * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      howManyMerges: number,
      maxIndexInColumn: number
    ) => {
      return (
        tileIndex +
        tileCountPerRowOrColumn *
          (maxIndexInColumn - tileInColumnIndex + howManyMerges)
      );
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      // NEW replaced the following two lines with code to randombly generate new starting tiles
      // createTile({ position: [0, 1], value: 2 });
      // createTile({ position: [0, 2], value: 2 });
      // NEW generate random positions for two tiles
      var position_tile_1_col = Math.floor(Math.random() * tileCountPerRowOrColumn);
      var position_tile_1_row = Math.floor(Math.random() * tileCountPerRowOrColumn);
      var position_tile_2_col = Math.floor(Math.random() * tileCountPerRowOrColumn);
      var position_tile_2_row = Math.floor(Math.random() * tileCountPerRowOrColumn);
      // NEW Check positions are not the same, and regenerate them until they are unique
      while ((position_tile_1_col === position_tile_2_col) && (position_tile_1_row === position_tile_2_row)) {
        // Regenerate positions
        position_tile_1_col = Math.floor(Math.random() * tileCountPerRowOrColumn);
        position_tile_1_row = Math.floor(Math.random() * tileCountPerRowOrColumn);
        position_tile_2_col = Math.floor(Math.random() * tileCountPerRowOrColumn);
        position_tile_2_row = Math.floor(Math.random() * tileCountPerRowOrColumn);
      }
      // NEW create both tiles using the randomly generated positions
      createTile({ position: [position_tile_1_col, position_tile_1_row], value: 2 });
      createTile({ position: [position_tile_2_col, position_tile_2_row], value: 2 });
      
      isInitialRender.current = false;
      return;
    }

    if (!inMotion && hasChanged) {
      generateRandomTile();
    }
  }, [hasChanged, inMotion, createTile, generateRandomTile]);

  const tileList = byIds.map((tileId) => tiles[tileId]);

  const moveLeft = moveLeftFactory();
  const moveRight = moveRightFactory();
  const moveUp = moveUpFactory();
  const moveDown = moveDownFactory();
// NEW add gameOver and gameScore to return value as a boolean and number
  return [gameScore, gameOver, tileList, moveLeft, moveRight, moveUp, moveDown] as [
    number,
    boolean,
    TileMeta[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
