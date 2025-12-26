export type Position = [number, number];

export type Board = (string | null)[][];

export interface Tile {
  id: string;
  position: Position;
  value: number;
}

export type TilesMap = Record<string, Tile>;

export type GameStatus = "ongoing" | "won" | "lost";

export interface ReducerState {
  board: Board;
  tiles: TilesMap;
  tilesByIds: string[];
  hasChanged: boolean;
  score: number;
  bestScore: number;
  status: GameStatus;
}

export type Move = "up" | "down" | "left" | "right";

export type ReducerActionMove = {
  type: Move;
};

export type ReducerAction =
  | ReducerActionMove
  | { type: "create_tile"; tile: Omit<Tile, "id"> }
  | { type: "clean_up" }
  | { type: "reset_game" }
  | { type: "update_status"; status: GameStatus };
