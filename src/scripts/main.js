import Game from '../modules/Game.class';
import { GAME_STATUS } from '../constants';

const game = new Game();

const gameScore = document.querySelector('.game-score');
const buttonStart = document.querySelector('.button.start');
const gameCells = document.querySelectorAll('.field-cell');
const messageWin = document.querySelector('.message-win');
const messageLose = document.querySelector('.message-lose');
const messageStart = document.querySelector('.message-start');

let touchStartX = 0;
let touchStartY = 0;

buttonStart.addEventListener('click', () => {
  if (buttonStart.classList.contains('start')) {
    game.start();

    buttonStart.textContent = 'RESTART';
    buttonStart.classList.replace('start', 'restart');
  } else {
    game.restart();

    buttonStart.textContent = 'START';
    buttonStart.classList.replace('restart', 'start');
  }

  updateUI();
});

document.addEventListener('keydown', (e) => {
  if (game.getStatus() !== GAME_STATUS.PLAYING) {
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      game.moveLeft();
      break;
    case 'ArrowRight':
      game.moveRight();
      break;
    case 'ArrowUp':
      game.moveUp();
      break;
    case 'ArrowDown':
      game.moveDown();
      break;
    default:
      return;
  }

  updateUI();
});

document.addEventListener(
  'touchstart',
  (e) => {
    if (game.getStatus() !== GAME_STATUS.PLAYING) {
      return;
    }
    e.preventDefault();

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: false }
);

document.addEventListener('touchend', (e) => {
  if (game.getStatus() !== GAME_STATUS.PLAYING) {
    return;
  }

  const touch = e.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const minDistance = 30;

  if (Math.abs(deltaX) < minDistance && Math.abs(deltaY) < minDistance) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    deltaX > 0 ? game.moveRight() : game.moveLeft();
  } else {
    deltaY > 0 ? game.moveDown() : game.moveUp();
  }

  updateUI();
});

function updateUI() {
  // Update cells
  const state = game.getState();

  gameCells.forEach((cell, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const value = state[row][col];

    cell.textContent = value || '';
    cell.className = 'field-cell' + (value ? ` field-cell--${value}` : '');
  });

  // Update score
  gameScore.textContent = game.getScore();

  // Update messages
  const gameStatus = game.getStatus();

  messageWin.classList.toggle('hidden', gameStatus !== GAME_STATUS.WIN);
  messageLose.classList.toggle('hidden', gameStatus !== GAME_STATUS.LOSE);
  messageStart.classList.toggle('hidden', gameStatus !== GAME_STATUS.IDLE);
}
