import OpenAI from "openai-api";
import { NextApiRequest, NextApiResponse } from 'next';

// require("dotenv").config();
// instantiate OpenAI API wrapper
const openai = new OpenAI(process.env.OPENAI_API_KEY!);



const api = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      const { prompt, responseType } = req.body;
      const maxTokens = 300;
      const temperature = 0.9;

      let responseTypePrompt = `respond in a tone of voice of ${responseType}`;
      let fullPrompt = `${responseTypePrompt} and you are customer support for a brand called PocketProjectr. the brand sells mini projectors that can be hooked up to any device with video output. please respond to the following email in a polite manner and if they are asking where their order is offer them a 20% discount code 20CODEOFF on another one and assure them that their order is on the way. make sure to let the customer know that we have indeed sent their order from our fulfilment center but the shipping company is at fault if they are asking about shipping or not recieving their order. let the customer know that if needed we will send another order to them to make sure they recieve their product after we hear back from Pitney Bowes if they are asking about shipping or not recieving their order. use the excuse that there was an issue with the shipping company and we are working to get an updated tracking number asap from them and we reached out to the shipping company, Pitney Bowes, on their behalf and opened a case with the company if they are asking about shipping or not recieving their order. if they are saying and item is defective or they would like to return, convince them that it may be user error. write the response as html and do not use /n for line breaks, use <br>. for the signature sign the email with "Best, John, PocketProjectr Support":`;
      fullPrompt += prompt;

      const openaiResponse = await openai.complete({
        engine: "text-davinci-003",
        prompt: fullPrompt,
        maxTokens,
        temperature,
      });
      res.status(200).json(openaiResponse.data.choices[0].text.replace(/[\n""]/g, ""));
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default api;
