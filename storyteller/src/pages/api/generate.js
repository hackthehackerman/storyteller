// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export default async function handler(req, res) {
  const imagePrompt = req.body.imagePrompt;
  const optionsPrompt = req.body.optionsPrompt;

  console.log(imagePrompt);
  console.log(optionsPrompt);

  const generated_image = await openai.images.generate({
    prompt: imagePrompt,
    model: "dall-e-3",
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  const generated_options =
    await openai.chat.completions.create({
      messages: [
        { role: "system", content: optionsPrompt },
      ],
      model: "gpt-4-0613",
      functions: [
        {
          name: "options",
          description:
            "Generate 2 potential options for the next comic panel. Keep it short and it should be at most two setences.",
          parameters: {
            type: "object",
            properties: {
              options: {
                type: "array",
                description:
                  "an array of potential options for the next comic panel",
                items: {
                  type: "object",
                  properties: {
                    option: {
                      description:
                        "a potential option for the next comic panel",
                    },
                  },
                },
              },
            },
          },
        },
      ],
      function_call: {
        name: "options",
      },
    });

  console.log(generated_image);
  console.log(generated_options);
  console.log(
    generated_options.choices[0].message.function_call
      .arguments
  );

  res.status(200).json({
    url: generated_image.data[0].url,
    options: JSON.parse(
      generated_options.choices[0].message.function_call
        .arguments
    ),
  });
}
