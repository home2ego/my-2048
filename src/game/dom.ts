function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);

  if (!el) {
    throw new Error(`Missing required element id: #${id}`);
  }

  return el as T;
}

export const elScore = getEl<HTMLDivElement>("scoreValue");
export const elBestScore = getEl<HTMLDivElement>("bestValue");
export const elTiles = getEl<HTMLDivElement>("tiles");
export const elSplash = getEl<HTMLDivElement>("splash");
export const elSplashTitle = getEl<HTMLHeadingElement>("splashTitle");
export const elRestart = getEl<HTMLButtonElement>("restart");
export const elBoard = getEl<HTMLDivElement>("board");
export const elAnnouncements = getEl<HTMLDivElement>("announcements");
