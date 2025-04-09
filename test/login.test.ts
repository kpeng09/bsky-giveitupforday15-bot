import { describe, expect, test} from '@jest/globals';
import { atpLogin } from '../src/bot.ts';

describe ('check api login', () => {
  test("login success", async () => {
    await expect(atpLogin()).resolves.not.toThrow();
  })
})