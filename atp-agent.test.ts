import {describe, expect, test} from '@jest/globals';
// import {getData} from './src/test.ts';

import sum from './src/test2.ts'

describe('testing', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1,2)).toBe(3);
  });
});
