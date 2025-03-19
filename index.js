"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@atproto/api");
const fs = require("fs");
const util = require("util");
const dotenv = require("dotenv");
dotenv.config();
const readFile = util.promisify(fs.readFile);
function loadImageData(path) {
    return __awaiter(this, void 0, void 0, function* () {
        // Read the file from the provided path
        let buffer = yield readFile(path);
        // Convert the buffer to a Uint8Array and return it
        return { data: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) };
    });
}
function postImage() {
    return __awaiter(this, void 0, void 0, function* () {
        const agent = new api_1.AtpAgent({ service: 'https://bsky.social' });
        yield agent.login({
            identifier: process.env.BSKY_IDENTIFIER,
            password: process.env.BSKY_PASSWORD
        });
        console.log(agent);
        // Converts the image from path to Uint8Array
        const { data } = yield loadImageData('../images/mrkrabs_day15.jpg');
        const uploadImage = yield agent.uploadBlob(data, { encoding: 'image/jpg' });
        yield agent.post({
            text: "GIVE IT UP FOR DAY 15",
            embed: {
                images: [
                    {
                        image: uploadImage.data.blob,
                        alt: 'mr krabs ringing the bell to signal its day 15'
                    },
                ],
                $type: 'app.bsky.embed.images',
            },
        });
    });
}
postImage();
