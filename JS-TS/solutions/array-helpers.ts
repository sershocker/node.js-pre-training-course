/* eslint-disable @typescript-eslint/no-unused-vars */
// Task 02: Mini functional–utility library
// All helpers are declared but not implemented.

export function mapArray<T, R>(source: readonly T[], mapper: (item: T, index: number) => R): R[] {
  if (source === null || source === undefined) throw new TypeError("Source array cannot be null or undefined");

  const result: R[] = [];

  for (let a = 0; a < source.length; a++) {
    result[a] = mapper(source[a], a);
  }
  return result;
}

export function filterArray<T>(source: readonly T[], predicate: (item: T, index: number) => boolean): T[] {
  if (source === null || source === undefined) throw new TypeError("Source array cannot be null or undefined");
  const result: T[] = [];

  for (let a = 0; a < source.length; a++) {
    if (predicate(source[a], a)) result[result.length] = source[a];
  }
  return result;
}

export function reduceArray<T, R>(source: readonly T[], reducer: (acc: R, item: T, index: number) => R, initial: R): R {
  if (source === null || source === undefined) throw new TypeError("Source array cannot be null or undefined");
  for (let a = 0; a < source.length; a++) {
    initial = reducer(initial, source[a], a);
  }
  return initial;
}

export function partition<T>(source: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  if (source === null || source === undefined) throw new TypeError("Source array cannot be null or undefined");
  const arrayOne: T[] = [];
  const arrayTwo: T[] = [];
  for (let a = 0; a < source.length; a++) {
    if (predicate(source[a])) arrayOne.push(source[a]);
    else arrayTwo.push(source[a]);
  }
  return [arrayOne, arrayTwo];
}

export function groupBy<T, K extends PropertyKey>(source: readonly T[], keySelector: (item: T) => K): Record<K, T[]> {
  if (source === null || source === undefined) throw new TypeError("Source array cannot be null or undefined");
  let result = {} as Record<K, T[]>;

  for (const item of source) {
    const key = keySelector(item);

    if (!(key in result)) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}
