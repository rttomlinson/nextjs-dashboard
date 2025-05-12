export const DEFAULT_WEIGHTS = x => {
  if (x < 0.75) {
    return 'blue';
  } else if (x >= 0.75 && x < 0.91) {
    return 'purple';
  } else if (x >= 0.91 && x < 0.97) {
    return 'pink';
  } else if (x >= 0.97 && x < 0.99) {
    return 'red';
  } else if (x >= 0.99 && x < 1) {
    return 'gold';
  }
};
