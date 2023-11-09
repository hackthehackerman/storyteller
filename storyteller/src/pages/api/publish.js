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
  const comics = req.body;

  console.log(comics);

  let r = (Math.random() + 1).toString(36).substring(7);

  downloadImage(comics[0].image, "panel1.png");
  downloadImage(comics[1].image, "panel2.png");
  downloadImage(comics[2].image, "panel3.png");
  downloadImage(comics[3].image, "panel4.png");

  const blob1 = await put(
    r + "panel1.png",
    fs.readFileSync("panel1.png"),
    {
      access: "public",
    }
  );
  const blob2 = await put(
    r + "panel2.png",
    fs.readFileSync("panel2.png"),
    {
      access: "public",
    }
  );
  const blob3 = await put(
    r + "panel3.png",
    fs.readFileSync("panel3.png"),
    {
      access: "public",
    }
  );
  const blob4 = await put(
    r + "panel4.png",
    fs.readFileSync("panel4.png"),
    {
      access: "public",
    }
  );

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  kv.rpush("comics", r);
  kv.rpush(r, {
    description: comics[0].description,
    image: blob1.url,
  });
  kv.rpush(r, {
    description: comics[1].description,
    image: blob2.url,
  });
  kv.rpush(r, {
    description: comics[2].description,
    image: blob3.url,
  });
  kv.rpush(r, {
    description: comics[3].description,
    image: blob4.url,
  });

  res.status(200).json({
    hello: "hello",
  });
}
