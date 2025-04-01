import { atpLogin, loadImageData, uploadImage, postImage } from './bot.ts';

async function bot() {
  const agent = await atpLogin();
  const { imageData } = await loadImageData('./images/mrkrabs_day15.jpg');
  const uploadedImage = await uploadImage(imageData, agent);
  await postImage(uploadedImage, agent);
  await agent.logout();
  console.log("Finished running.")
}

bot()

export { bot }
