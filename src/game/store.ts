import type {
  Direction,
  GameStatus,
  Position,
  ReducerActionMove,
  ReducerState,
} from "../types";
import {
  BEST_SCORE_KEY,
  MERGE_DURATION,
  TILE_COUNT,
  WIN_TILE,
} from "./constants";
import { elAnnouncements } from "./dom";
import { isReducedMotion } from "./motion";
import { createInitialState, reducer } from "./reducer";
import { render } from "./render";

let state: ReducerState = createInitialState();

export function getState(): ReducerState {
  return state;
}

function computeStatus(state: ReducerState): GameStatus {
  if (state.status !== "ongoing") return state.status;

  // Win
  for (const id of state.tilesByIds) {
    if (state.tiles[id].value >= WIN_TILE) return "won";
  }

  // Any empty cell - ongoing
  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      if (state.board[y][x] === null) return "ongoing";
    }
  }

  // Any merge available - ongoing
  const max = TILE_COUNT - 1;

  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      const id = state.board[y][x] as string;
      const v = state.tiles[id].value;

      if (x < max) {
        const horizontalId = state.board[y][x + 1] as string;
        if (state.tiles[horizontalId].value === v) return "ongoing";
      }

      if (y < max) {
        const verticalId = state.board[y + 1][x] as string;
        if (state.tiles[verticalId].value === v) return "ongoing";
      }
    }
  }

  return "lost";
}

function setStatusIfNeeded(state: ReducerState): ReducerState {
  const status = computeStatus(state);

  return status === state.status
    ? state
    : reducer(state, { type: "update_status", status });
}

function getEmptyCells(state: ReducerState): Position[] {
  const empty: Position[] = [];

  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      if (state.board[y][x] === null) empty.push([x, y]);
    }
  }

  return empty;
}

function spawnRandomTile(state: ReducerState): ReducerState {
  const emptyCells = getEmptyCells(state);

  if (emptyCells.length === 0) return state;

  const idx = Math.floor(Math.random() * emptyCells.length);

  return reducer(state, {
    type: "create_tile",
    tile: { position: emptyCells[idx], value: 2 },
  });
}

function announce(message: string) {
  elAnnouncements.textContent = message;
}

function finalizeMove(direction: Direction | "") {
  state = reducer(state, { type: "clean_up" });

  // Don't spawn a new tile if won
  if (state.status === "ongoing") {
    state = spawnRandomTile(state);
    state = setStatusIfNeeded(state);
  }

  render(state);

  if (state.status === "ongoing") {
    announce(`Moved ${direction}. Score: ${state.score}. New tile 2 added.`);
  } else if (state.status === "won") {
    announce(
      `You won! Reached 2048. Score: ${state.score}. Press R or click Play again to start a new game.`,
    );
  } else if (state.status === "lost") {
    announce(
      `Game over. Final score: ${state.score}. Press R or click Play again to start a new game.`,
    );
  }
}

export function restartGame(): void {
  state = reducer(state, { type: "reset_game" });

  startGame();
}

export function startGame(): void {
  state = spawnRandomTile(state);
  state = spawnRandomTile(state);

  render(state);

  announce(`New game started. Score: ${state.score}`);
}

export function dispatch(action: ReducerActionMove) {
  const previousBest = state.bestScore; // Old best score
  state = reducer(state, action);

  // Update if the best score updated in this move
  if (state.bestScore > previousBest) {
    localStorage.setItem(BEST_SCORE_KEY, String(state.bestScore));
  }

  state = setStatusIfNeeded(state);

  render(state);

  if (!state.hasChanged) return;

  const direction = action.type.replace("move_", "") as Direction;

  if (isReducedMotion) {
    finalizeMove(direction);
  } else {
    // Wait for move/merge animation if not reduced motion, then finalize and spawn tile
    window.setTimeout(() => finalizeMove(direction), MERGE_DURATION);
  }
}
