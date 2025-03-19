import { AtpAgent } from '@atproto/api';
import * as fs from 'fs';
import * as util from 'util';
import * as dotenv from 'dotenv';

dotenv.config();

const readFile = util.promisify(fs.readFile);

async function loadImageData(path: fs.PathLike): Promise<{imageData: Uint8Array}> {
  // Read the file from the provided path
  const buffer = await readFile(path);

  // Convert the buffer to a Uint8Array and return it
  return { imageData: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) };
}

async function atpLogin(): Promise<AtpAgent> {
  const agent = new AtpAgent({ service: 'https://bsky.social' })

  await agent.login({
    identifier: process.env.BSKY_IDENTIFIER,
    password: process.env.BSKY_PASSWORD
  });

  return agent
}

async function postImage(agent: AtpAgent): Promise<void> {

  // Converts the image from path to Uint8Array
  const { imageData } = await loadImageData('./images/mrkrabs_day15.jpg');

  const uploadImage = await agent.uploadBlob(imageData, { encoding: 'image/jpg' });

  await agent.post({
    text: "GIVE IT UP FOR DAY 15",
    embed: {
      images: [
        {
          image: uploadImage.data.blob,
          alt: 'Mr. Krabs ringing the bell to signal it is day 15 of the month.'
        },
      ],
      $type: 'app.bsky.embed.images',
    },
  });
}

async function main() {
  const agent = await atpLogin();
  await postImage(agent);
}

main()

// export default postImage