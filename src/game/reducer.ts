import type {
  Board,
  Move,
  ReducerAction,
  ReducerState,
  Tile,
  TilesMap,
} from "../types";
import { BEST_SCORE_KEY, TILE_COUNT } from "./constants";

function createEmptyBoard(): Board {
  return Array.from({ length: TILE_COUNT }, () => Array(TILE_COUNT).fill(null));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

let idCounter = 0;

const getNewId = () => {
  idCounter += 1;
  return `t${idCounter}`;
};

export function createInitialState(): ReducerState {
  // Reset id counter
  idCounter = 0;

  const savedBest = localStorage.getItem(BEST_SCORE_KEY);
  const bestScore = savedBest ? Number.parseInt(savedBest, 10) : 0;

  return {
    board: createEmptyBoard(),
    tiles: {},
    tilesByIds: [],
    hasChanged: false,
    score: 0,
    bestScore,
    status: "ongoing",
  };
}

export function reducer(
  prev: ReducerState,
  action: ReducerAction,
): ReducerState {
  switch (action.type) {
    case "up":
      return moveTiles(prev, "up");

    case "down":
      return moveTiles(prev, "down");

    case "left":
      return moveTiles(prev, "left");

    case "right":
      return moveTiles(prev, "right");

    case "clean_up": {
      const tiles: TilesMap = {};
      const ids: string[] = [];

      for (let y = 0; y < TILE_COUNT; y++) {
        for (let x = 0; x < TILE_COUNT; x++) {
          const id = prev.board[y][x];

          if (id === null) continue;

          tiles[id] = prev.tiles[id];
          ids.push(id);
        }
      }

      return {
        ...prev,
        tiles,
        tilesByIds: ids,
        hasChanged: false,
      };
    }

    case "create_tile": {
      const id = getNewId();
      const [x, y] = action.tile.position;
      const board = cloneBoard(prev.board);
      board[y][x] = id;

      return {
        ...prev,
        board,
        tiles: {
          ...prev.tiles,
          [id]: { ...action.tile, id },
        },
        tilesByIds: [...prev.tilesByIds, id],
      };
    }

    case "reset_game":
      return createInitialState();

    case "update_status":
      return { ...prev, status: action.status };

    default:
      return prev;
  }
}

function moveTiles(prev: ReducerState, direction: Move): ReducerState {
  const isVertical = direction === "up" || direction === "down";
  const isReverse = direction === "down" || direction === "right";

  const board = createEmptyBoard();
  const tiles: TilesMap = {};
  let hasChanged = false;
  let score = prev.score;

  // lineIndex represents a Column (if vertical) or a Row (if horizontal)
  for (let lineIdx = 0; lineIdx < TILE_COUNT; lineIdx++) {
    let nextPos = isReverse ? TILE_COUNT - 1 : 0;
    let previousTile: Tile | undefined;

    // cellIndex represents the progress through that specific line
    for (let cellIdx = 0; cellIdx < TILE_COUNT; cellIdx++) {
      const idx = isReverse ? TILE_COUNT - 1 - cellIdx : cellIdx;
      const x = isVertical ? lineIdx : idx;
      const y = isVertical ? idx : lineIdx;

      const id = prev.board[y][x];
      if (id === null) continue;

      const currentTile = prev.tiles[id];

      // Determine target position
      const targetX = isVertical ? lineIdx : nextPos;
      const targetY = isVertical ? nextPos : lineIdx;

      // Merge logic
      if (previousTile && previousTile.value === currentTile.value) {
        const mergedValue = previousTile.value * 2;
        score += mergedValue;

        tiles[previousTile.id] = {
          ...previousTile,
          value: mergedValue,
        };

        tiles[id] = { ...currentTile, position: [targetX, targetY] };

        previousTile = undefined;
        hasChanged = true;
        continue;
      }

      // Movement logic
      board[targetY][targetX] = id;
      tiles[id] = { ...currentTile, position: [targetX, targetY] };

      if (
        currentTile.position[0] !== targetX ||
        currentTile.position[1] !== targetY
      ) {
        hasChanged = true;
      }

      previousTile = tiles[id];
      isReverse ? nextPos-- : nextPos++;
    }
  }

  const bestScore = Math.max(score, prev.bestScore);
  const tilesByIds = Object.keys(tiles);

  return { ...prev, board, tiles, tilesByIds, hasChanged, score, bestScore };
}
