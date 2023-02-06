// NOT USED ANYMORE, REPLACED BY EXPRESS SERVER inside of server/index.js
import { NextApiRequest, NextApiResponse } from 'next';

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  res.statusCode = 200;
  res.json({ name: 'John Doe' });
};

// import OpenAI from "openai-api";
// import { NextApiRequest, NextApiResponse } from 'next';

// // instantiate OpenAI API wrapper
// const openai = new OpenAI(process.env.OPENAI_API_KEY!);
// console.log(process.env.OPENAI_API_KEY!);


// const api = async (req: NextApiRequest, res: NextApiResponse) => {
//   switch (req.method) {
//     case 'POST':
//       const { prompt, responseType, fromEmail, trainingRules } = req.body;
//       const maxTokens = 300;
//       const temperature = 0.9;


//       let responseTypePrompt = `respond in a tone of voice of ${responseType}`;
//       let fullPrompt = `${responseTypePrompt} and ${trainingRules} write the response as html and do not use /n for line breaks, use <br>: from:${fromEmail}: do not continue the sentence, this is the full email: ${prompt}`;

//       const openaiResponse = await openai.complete({
//         engine: "text-davinci-003",
//         prompt: fullPrompt,
//         maxTokens,
//         temperature,
//       });
//       res.status(200).json(openaiResponse.data.choices[0].text.replace(/[\n""]/g, ""));
//       break;
//     default:
//       res.setHeader('Allow', ['POST']);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// export default api;
