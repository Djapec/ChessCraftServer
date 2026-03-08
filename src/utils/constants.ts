export const collections = Object.freeze({
  ROUND: 'Round',
  GAME: 'Game',
  TOURNAMENT: 'Tournament',
  DELAYED_RESULT: 'DelayedResult',
});

export const gameResultMap: Map<string, string> = new Map([
  ['BLACKWIN', '0-1'],
  ['WHITEWIN', '1-0'],
  ['DRAW', `1/2-1/2`],
  ['*', '*'],
]);
