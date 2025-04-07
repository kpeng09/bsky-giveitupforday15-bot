import { AtpAgent } from '@atproto/api';
import { Response } from '@atproto/api/dist/client/types/com/atproto/repo/uploadBlob';
import * as fs from 'fs';
import * as util from 'util';
import * as dotenv from 'dotenv';

// Create AtpAgent and login to BlueSky
async function atpLogin(): Promise<AtpAgent> {
  try {
    dotenv.config();
    const agent = new AtpAgent({ service: 'https://bsky.social' })

    await agent.login({
      identifier: process.env.BSKY_IDENTIFIER,
      password: process.env.BSKY_PASSWORD
    });

    return agent;
  } catch (error) {
      throw Error("BlueSky is unable to login - ".concat(error));
  }
}

// Converts .jpg image buffer to a Uint8Array
async function loadImageData(path: fs.PathLike) {
  try {
    const readFile = util.promisify(fs.readFile);
    const buffer = await readFile(path);
    return { imageData: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) };
  } catch (error) {
    throw Error("Unable to load image data - ".concat(error));
  }
}

// Uploads the image to BlueSky servers
async function uploadImage(imageData: Uint8Array, agent: AtpAgent) {
  try {
    const uploadedImage = await agent.uploadBlob(imageData, { encoding: 'image/jpg' });
    return uploadedImage;
  } catch (error) {
    throw Error("Unable to upload image to BlueSky - ".concat(error));
  }
}

// Makes post to BlueSky
async function postImage(uploadedImage: Response, agent: AtpAgent) {
  try {
    await agent.post({
      text: "GIVE IT UP FOR DAY 15",
      embed: {
        images: [
          {
            image: uploadedImage.data.blob,
            alt: 'Mr. Krabs ringing the bell to signal it is day 15 of the month.'
          },
        ],
        $type: 'app.bsky.embed.images',
      }
    });
  } catch (error) {
    throw Error("Unable to post to BlueSky - ".concat(error));
  }
}

export { atpLogin, loadImageData, uploadImage, postImage }
