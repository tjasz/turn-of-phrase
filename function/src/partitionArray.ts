function partitionArray<T>(arr: T[], fn: (val: T, i: number, arr: T[]) => boolean): [T[], T[]] {
  return arr.reduce(
    (acc, val, i, arr) => {
      acc[fn(val, i, arr) ? 0 : 1].push(val);
      return acc;
    },
    [[], []] // Initial accumulator: an array containing two empty arrays
  );
}

export default partitionArray;