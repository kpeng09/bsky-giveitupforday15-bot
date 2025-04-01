import {describe, expect, test, jest} from '@jest/globals';
import { atpLogin, uploadImage, postImage } from '../src/bot.ts';
import * as dotenv from 'dotenv';
import { AtpAgent } from '@atproto/api';

jest.mock('@atproto/api');

describe("atpLogin", () => {
  dotenv.config();

  const mockedAgent = {
    login: jest.fn(),
  } as unknown as jest.MockedObject<AtpAgent>
  
  jest.mocked(AtpAgent).mockReturnValueOnce(mockedAgent)
   
  test('login success', async () => {
    const result = await atpLogin();
  
    expect(result).toStrictEqual(mockedAgent);
    expect(AtpAgent).toHaveBeenCalledTimes(1);
    expect(mockedAgent.login).toHaveBeenCalledTimes(1);
    expect(mockedAgent.login).toHaveBeenCalledWith({
      identifier: process.env.BSKY_IDENTIFIER,
      password: process.env.BSKY_PASSWORD,
    })
  })
  
  test('login error handling', async () => {
    jest.mocked(AtpAgent).mockImplementation(() => {
      throw Error('Test login error')
    })

    const result = atpLogin()
    
    await expect(result).rejects.toThrowError(
      "BlueSky is unable to login - Error: Test login error"
    )

  })
})

describe("uploadImage", () => {
  const mockedAgent = {
    uploadBlob: jest.fn()
  } as unknown as jest.MockedObject<AtpAgent>

  test('upload success', async () => {
    jest.spyOn(mockedAgent, 'uploadBlob').mockResolvedValue({ 
      success: true,
      headers: {},
      data: {
        blob: null
      }
    })

    const mockUint8Array = new Uint8Array();
    const mockedResponse = { 
      success: true,
      headers: {},
      data: {
        blob: null
      }
    }

    const result = await uploadImage(mockUint8Array, mockedAgent)
    expect(result).toStrictEqual(mockedResponse)

    expect(mockedAgent.uploadBlob).toHaveBeenCalledTimes(1);
    expect(mockedAgent.uploadBlob).toHaveBeenCalledWith(
      new Uint8Array(), 
      { encoding: 'image/jpg' }
    )
  })

  test('upload error handling', async () => {
    jest.spyOn(mockedAgent, 'uploadBlob').mockRejectedValue('Test upload error')

    const mockUint8Array = new Uint8Array();
    const result = uploadImage(mockUint8Array, mockedAgent)

    await expect(result).rejects.toThrowError(
      'Unable to upload image to BlueSky - Test upload error'
    )
  })
})

describe("postImage", () => {
  const mockedAgent = {
    post: jest.fn()
  } as unknown as jest.MockedObject<AtpAgent>

  const mockedUploadedImage = { 
    success: true,
    headers: {},
    data: {
      blob: null
    }
  }

  test("post success", async () => {  
    const result = postImage(mockedUploadedImage, mockedAgent);

    await expect(result).resolves.not.toThrow();
    expect(mockedAgent.post).toHaveBeenCalledTimes(1);
    expect(mockedAgent.post).toHaveBeenCalledWith({
      text: "GIVE IT UP FOR DAY 15",
      embed: {
        images: [
          {
            image: mockedUploadedImage.data.blob,
            alt: 'Mr. Krabs ringing the bell to signal it is day 15 of the month.'
          },
        ],
        $type: 'app.bsky.embed.images',
      }
    })
  })

  test("post error handling", async () => {
    jest.spyOn(mockedAgent, 'post').mockRejectedValue('Test post error')

    const result = postImage(mockedUploadedImage, mockedAgent);
    await expect(result).rejects.toThrowError(
      'Unable to post to BlueSky - Test post error'
    )
  })
})




