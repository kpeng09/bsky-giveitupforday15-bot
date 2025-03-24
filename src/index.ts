import { AtpAgent } from '@atproto/api';
import * as fs from 'fs';
import * as util from 'util';
import * as dotenv from 'dotenv';

dotenv.config();

const readFile = util.promisify(fs.readFile);

async function atpLogin(): Promise<AtpAgent> {
  try {
    const agent = new AtpAgent({ service: 'https://bsky.social' })

    await agent.login({
      identifier: process.env.BSKY_IDENTIFIER,
      password: process.env.BSKY_PASSWORD
    });

    return agent;
  } catch (error) {
      console.log('Error while logging into BlueSky: ', error);
  }
}

// Converts .jpg image buffer to a Uint8Array
async function loadImageData(path: fs.PathLike): Promise<{imageData: Uint8Array}> {
  const buffer = await readFile(path);

  return { imageData: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) };
}

// Uploads the image to BlueSky servers
async function uploadImage(imageData: Uint8Array ,agent: AtpAgent) {
  try {
    const uploadedImage = await agent.uploadBlob(imageData, { encoding: 'image/jpg' });
    return uploadedImage;
  } catch (error) {
    console.log('Error while uploading image to BlueSky: ', error);
  }
}

// Make post to BlueSky
async function postImage(uploadedImage, agent: AtpAgent): Promise<void> {
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
      },
    });
  } catch (error) {
    console.log("Error posting to BlueSky: ", error);
  }
}

async function main() {
  const agent = await atpLogin();
  const { imageData } = await loadImageData('./images/mrkrabs_day15.jpg');
  const uploadedImage = await uploadImage(imageData, agent);
  await postImage(uploadedImage, agent);
}

main()

export default {atpLogin, uploadImage}