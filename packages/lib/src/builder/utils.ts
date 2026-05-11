export const between = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const rand = () => Math.random();
