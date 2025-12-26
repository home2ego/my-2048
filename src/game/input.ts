import type { MoveType } from "../types";
import { MERGE_DURATION, SWIPE_THRESHOLD } from "./constants";
import { elBoard, elRestart } from "./dom";
import { isReducedMotion } from "./motion";
import { dispatch, getState, restartGame, startGame } from "./store";

let moveLocked = false;

function tryMove(type: MoveType) {
  if (moveLocked) return;
  if (getState().status !== "ongoing") return;

  moveLocked = true;
  dispatch({ type });

  // If nothing moved/merged or reduced motion, unlock immediately
  if (!getState().hasChanged || isReducedMotion) {
    moveLocked = false;
    return;
  }

  window.setTimeout(() => {
    moveLocked = false;
  }, MERGE_DURATION);
}

function handleKeyDown(e: KeyboardEvent) {
  const isReloadShortcut =
    e.code === "KeyR" && (e.altKey || e.ctrlKey || e.metaKey);

  if (e.code.startsWith("Arrow") || isReloadShortcut) e.preventDefault();

  switch (e.code) {
    case "ArrowUp":
      tryMove("move_up");
      break;
    case "ArrowDown":
      tryMove("move_down");
      break;
    case "ArrowLeft":
      tryMove("move_left");
      break;
    case "ArrowRight":
      tryMove("move_right");
      break;
    case "KeyR":
      if (!isReloadShortcut) restartGame();
      break;
  }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return;

  if (absX > absY) {
    tryMove(deltaX > 0 ? "move_right" : "move_left");
  } else {
    tryMove(deltaY > 0 ? "move_down" : "move_up");
  }

  touchStartX = 0;
  touchStartY = 0;
}

export function initGame() {
  window.addEventListener("keydown", handleKeyDown);

  elBoard.addEventListener("touchstart", handleTouchStart, { passive: true });
  elBoard.addEventListener("touchend", handleTouchEnd, { passive: true });

  elRestart.addEventListener("click", restartGame);

  startGame();
}
