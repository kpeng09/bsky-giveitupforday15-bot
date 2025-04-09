import {describe, expect, test, jest} from '@jest/globals';
import { atpLogin, uploadImage, postImage } from '../src/bot.ts';
import * as dotenv from 'dotenv';
import { AtpAgent } from '@atproto/api';
import { BlobRef } from '@atproto/api';

jest.mock('@atproto/api');

describe("atpLogin", () => {
  const mockAgent = {
    login: jest.fn(),
  } as unknown as jest.MockedObject<AtpAgent>
  
  test('login success', async () => {
    jest.mocked(AtpAgent).mockReturnValueOnce(mockAgent)
    dotenv.config();
    const result = await atpLogin();
  
    expect(result).toStrictEqual(mockAgent);
    expect(AtpAgent).toHaveBeenCalledTimes(1);
    expect(mockAgent.login).toHaveBeenCalledTimes(1);
    expect(mockAgent.login).toHaveBeenCalledWith({
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
  const mockAgent = {
    uploadBlob: jest.fn()
  } as unknown as jest.MockedObject<AtpAgent>

  const mockBlobRef = {} as unknown as jest.MockedObject<BlobRef>

  test('upload success', async () => {
    jest.spyOn(mockAgent, 'uploadBlob').mockResolvedValue({ 
      success: true,
      headers: {},
      data: {
        blob: mockBlobRef
      }
    })

    const mockUint8Array = new Uint8Array();
    const mockResponse = { 
      success: true,
      headers: {},
      data: {
        blob: mockBlobRef
      }
    }

    const result = await uploadImage(mockUint8Array, mockAgent)
    expect(result).toStrictEqual(mockResponse)

    expect(mockAgent.uploadBlob).toHaveBeenCalledTimes(1);
    expect(mockAgent.uploadBlob).toHaveBeenCalledWith(
      new Uint8Array(), 
      { encoding: 'image/jpg' }
    )
  })

  test('upload error handling', async () => {
    jest.spyOn(mockAgent, 'uploadBlob').mockRejectedValue('Test upload error')

    const mockUint8Array = new Uint8Array();
    const result = uploadImage(mockUint8Array, mockAgent)

    await expect(result).rejects.toThrowError(
      'Unable to upload image to BlueSky - Test upload error'
    )
  })
})

describe("postImage", () => {
  const mockAgent = {
    post: jest.fn()
  } as unknown as jest.MockedObject<AtpAgent>

  const mockBlobRef = {} as unknown as jest.MockedObject<BlobRef>

  const mockUploadedImage = { 
    success: true,
    headers: {},
    data: {
      blob: mockBlobRef
    }
  }

  test("post success", async () => {  
    const result = postImage(mockUploadedImage, mockAgent);

    await expect(result).resolves.not.toThrow();
    expect(mockAgent.post).toHaveBeenCalledTimes(1);
    expect(mockAgent.post).toHaveBeenCalledWith({
      text: "GIVE IT UP FOR DAY 15",
      embed: {
        images: [
          {
            image: mockUploadedImage.data.blob,
            alt: 'Mr. Krabs ringing the bell to signal it is day 15 of the month.'
          },
        ],
        $type: 'app.bsky.embed.images',
      }
    })
  })

  test("post error handling", async () => {
    jest.spyOn(mockAgent, 'post').mockRejectedValue('Test post error')

    const result = postImage(mockUploadedImage, mockAgent);
    await expect(result).rejects.toThrowError(
      'Unable to post to BlueSky - Test post error'
    )
  })
})




