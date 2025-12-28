# 🎮 2048 Game

A clone of the classic **2048** puzzle game, built from scratch with a strong focus on smooth animations, accessibility, and cross-device compatibility.

This project started as a fun challenge to implement game logic in **vanilla TypeScript** without relying on heavy frameworks — and ended up being one of my favorite personal projects.

**[Play it now!](https://my-2048.pages.dev/)** 🚀

## 🧰 Technologies

- **TypeScript**
- **SCSS**
- **HTML5**
- **Vite**

Pure vanilla implementation - no frameworks.

## ✨ Features

- Smooth tile animations
- Full keyboard support (arrow keys `⬆️ ⬇️ ⬅️ ➡️` + `R` to restart)
- Touch/swipe controls for mobile & tablet
- Score tracking with persistent best score (via `localStorage`)
- Win state when reaching the **2048** tile
- Game over state when no moves are left
- Fully responsive layout for any screen size

## ♿ Accessibility:

- ARIA live regions to announce moves and game state (start, win, lose) for screen reader users
- Auto-focus management on restart button in win/lose overlay
- Decorative elements removed from the **Accessibility Tree** to reduce noise
- Respects `prefers-reduced-motion` - animations are disabled for motion-sensitive users

## 🕹️ How to Play

- **Desktop**: Use arrow keys `⬆️ ⬇️ ⬅️ ➡️` to move tiles. Press `R` to restart
- **Mobile/Tablet**: Swipe to move tiles
- Tiles with the same number merge when they collide (e.g. `2 + 2 = 4`)
- A new tile (`2`) spawns after each valid move
- Reach the **2048** tile to win
- Game ends when the grid is full and no moves are possible

## 🚀 How Can It Be Improved?

There’s still plenty of room to make the game even better. Here are some ideas I've been thinking about:

### Gameplay:
- Allow players to **continue playing after reaching 2048**
- Add an **Undo move** mechanic + keyboard shortcut (`Ctrl + Z`)
- Add a limited **Swap two tiles** mechanic
- Occasionally spawn a `4` instead of always a `2` (like 10% chance)

### Visuals & UX:
- Add a dark/light theme toggle (I'd like to experiment with the new `light-dark()` CSS function instead of relying solely on `prefers-color-scheme`, which I normally use)
- Subtle sound effects for moves and merges - satisfying, not annoying

### Technical & Scaling:
- Support different board sizes (`3×3`, `5×5`)
- Simple leaderboard - starting with local high scores, possibly expanding to a small backend for global rankings

If you have any other ideas, feel free to send a PR - I'd love to see what you come up with! 😄

## 📚 What I Learned

Building this little game taught me way more than I expected:

- How much you can actually achieve with just vanilla TypeScript - no need for a big framework for everything
- Getting animations to feel "buttery smooth" is all about the small details:
    - Using `transform` (which only triggers the composite stage in the **Rendering Pipeline**) instead of `left/top` that force layout and paint steps
    - Keeping DOM updates minimal
    - Letting the browser handle the animation work with CSS transitions instead of JavaScript
- Touch swipe detection is trickier than it looks - figuring out the direction reliably without false positives took a few iterations
- Adding live regions and proper focus management made me realize how much a few ARIA attributes can improve the experience for screen reader users - and it's not that hard once you get the pattern.

Overall, it reminded me why I love building things: you start with a blank page and end up with something interactive that just *feels* nice to use.

## ▶️ Running the Project

1. git clone https://github.com/home2ego/my-2048.git
2. cd my-2048
3. npm install     # or pnpm install / yarn install
4. npm run dev     # or pnpm dev / yarn dev