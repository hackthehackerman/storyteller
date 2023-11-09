// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import OpenAI from "openai";
import { put } from "@vercel/blob";
const fs = require("fs");
const client = require("https");
export const maxDuration = 300;
import { createClient } from "@vercel/kv";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

function downloadImage(url, filepath) {
  client.get(url, (res) => {
    res.pipe(fs.createWriteStream(filepath));
  });
}

export default async function handler(req, res) {
  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  var result = [];
  const all_comics = await kv.lrange("comics", 0, -1);
  console.log(all_comics);

  for (const comic of all_comics) {
    result.push(await kv.lrange(comic, 0, -1));
  }

  console.log(result);

  res.status(200).json({
    result: result,
  });
}
