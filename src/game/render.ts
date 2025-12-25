import type { GameStatus, ReducerState } from "../types";
import { MERGE_DURATION } from "./constants";
import {
  elBestScore,
  elRestart,
  elScore,
  elSplash,
  elSplashTitle,
  elTiles,
} from "./dom";
import { isReducedMotion } from "./motion";

const tileEls = new Map<string, HTMLDivElement>();
const prevValueById = new Map<string, number>();

function showSplash(status: GameStatus) {
  if (status === "won") {
    elSplashTitle.textContent = "You won!";
    elSplash.classList.add("win");
    elRestart.focus();
    elSplash.classList.remove("hidden", "lost");
    return;
  }

  if (status === "lost") {
    elSplashTitle.textContent = "Game over";
    elSplash.classList.add("lost");
    elRestart.focus();
    elSplash.classList.remove("hidden", "win");
    return;
  }

  elSplash.classList.add("hidden");
  elSplash.classList.remove("win", "lost");
}

function ensureTileEl(id: string): HTMLDivElement {
  let el = tileEls.get(id);

  if (!el) {
    el = document.createElement("div");
    el.className = "tile";
    tileEls.set(id, el);
    elTiles.appendChild(el);
  }

  return el;
}

function pop(el: HTMLDivElement) {
  el.style.scale = "1.1";

  window.setTimeout(() => {
    el.style.scale = "1";
  }, MERGE_DURATION);
}

export function render(state: ReducerState) {
  // Score
  elScore.textContent = String(state.score);
  elBestScore.textContent = String(state.bestScore);

  // Splash (win / lose)
  showSplash(state.status);

  // Current tiles
  const aliveIds = new Set(state.tilesByIds);

  // Remove stale tiles
  for (const [id, el] of tileEls) {
    if (aliveIds.has(id)) continue;

    el.remove();
    tileEls.delete(id);
    prevValueById.delete(id);
  }

  // Create / update tiles
  for (const id of state.tilesByIds) {
    const tile = state.tiles[id];
    const el = ensureTileEl(id);

    // Update appearance
    el.className = `tile tile${tile.value}`;
    el.textContent = String(tile.value);

    // Position
    const [x, y] = tile.position;
    el.style.translate =
      `calc(var(--border) + ${x} * (var(--cell) + var(--gap))) ` +
      `calc(var(--border) + ${y} * (var(--cell) + var(--gap)))`;

    // Pop animation on new tile or merge if not reduced motion
    if (!isReducedMotion && prevValueById.get(id) !== tile.value) pop(el);

    prevValueById.set(id, tile.value);
  }
}
