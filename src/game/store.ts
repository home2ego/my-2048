import type {
  GameStatus,
  Move,
  Position,
  ReducerActionMove,
  ReducerState,
} from "../types";
import { MERGE_DURATION, TILE_COUNT, WIN_TILE } from "./constants";
import { elAnnouncements } from "./dom";
import { isReducedMotion } from "./motion";
import { createInitialState, reducer } from "./reducer";
import { render } from "./render";

let state: ReducerState = createInitialState();

export function getState(): ReducerState {
  return state;
}

function checkStatus(state: ReducerState): GameStatus {
  // Win
  for (const id of state.tilesByIds) {
    if (state.tiles[id].value >= WIN_TILE) return "won";
  }

  // Any empty cell - ongoing
  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      const id = state.board[y][x];

      if (id === null) return "ongoing";
    }
  }

  // Any merge available - ongoing
  const lastIndex = TILE_COUNT - 1;

  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      const id = state.board[y][x];

      if (id === null) continue;

      const value = state.tiles[id].value;

      // Horizontal check
      if (x < lastIndex) {
        const horizontalId = state.board[y][x + 1];

        if (horizontalId === null) continue;

        if (state.tiles[horizontalId].value === value) return "ongoing";
      }

      // Vertical check
      if (y < lastIndex) {
        const verticalId = state.board[y + 1][x];

        if (verticalId === null) continue;

        if (state.tiles[verticalId].value === value) return "ongoing";
      }
    }
  }

  return "lost";
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

function announceMove(status: GameStatus, direction: Move) {
  const message = {
    ongoing: `Moved ${direction}. Score: ${state.score}. New tile 2 added.`,
    won: `You won! Reached 2048. Score: ${state.score}. Press R or click Play again to start a new game.`,
    lost: `Game over. Final score: ${state.score}. Press R or click Play again to start a new game.`,
  };

  elAnnouncements.textContent = message[status];
}

function finalizeMove(direction: Move) {
  // Clean up merged tiles
  state = reducer(state, { type: "clean_up" });

  // Spawn new tile if game ongoing
  let status = checkStatus(state);
  if (status === "ongoing") {
    state = spawnRandomTile(state);
    status = checkStatus(state);
  }

  // Update status
  if (status !== state.status) {
    state = reducer(state, { type: "update_status", status });
  }

  // Render and announce
  render(state);
  announceMove(status, direction);
}

export function restartGame(): void {
  state = reducer(state, { type: "reset_game" });

  startGame();
}

export function startGame(): void {
  state = spawnRandomTile(state);
  state = spawnRandomTile(state);

  render(state);

  elAnnouncements.textContent = `New game started. Score: ${state.score}`;
}

export function dispatch(action: ReducerActionMove) {
  state = reducer(state, action);

  render(state);

  if (!state.hasChanged) return;

  if (isReducedMotion) {
    finalizeMove(action.type);
  } else {
    // Wait for move/merge animation if not reduced motion, then finalize and spawn tile
    window.setTimeout(() => finalizeMove(action.type), MERGE_DURATION);
  }
}
