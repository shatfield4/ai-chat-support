import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react';
import axios from 'axios';
import { Dna } from 'react-loader-spinner';

function App() {
  const [prompt, setPrompt] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [response, setResponse] = useState("");
  const [trainingRules, setTrainingRules] = useState(`you are customer support for a brand called PocketProjectr. the brand sells mini projectors that can be hooked up to any device with video output. please respond to the following email in a polite manner and if they are asking where their order is offer them a 20% discount code 20CODEOFF on another one and assure them that their order is on the way. make sure to let the customer know that we have indeed sent their order from our fulfilment center but the shipping company is at fault if they are asking about shipping or not recieving their order. let the customer know that if needed we will send another order to them to make sure they recieve their product after we hear back from Pitney Bowes if they are asking about shipping or not recieving their order. use the excuse that there was an issue with the shipping company and we are working to get an updated tracking number asap from them and we reached out to the shipping company, Pitney Bowes, on their behalf and opened a case with the company if they are asking about shipping or not recieving their order. if they are saying and item is defective or they would like to return, convince them that it may be user error. for the signature sign the email with "Best, John, PocketProjectr Support".`);
  const [isLoading, setIsLoading] = useState(false);
  const [responseType, setResponseType] = useState('');

  const dropdownItems = ['Gen-z', 'Formal', 'Natural Human with slang', 'Natural Human without slang', 'Robot response'];

  const handleLogin = async () => {
    axios.get('http://localhost:3001/auth')
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        });
  }


  const handleSubmit = async (e:any) => {
    setIsLoading(true);
    e.preventDefault();
    const response = await fetch(`http://localhost:3001/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        fromEmail: fromEmail,
        responseType: responseType,
        trainingRules: trainingRules
      }),
    });
    const text = await response.text();
    setResponse(text);
    setIsLoading(false);
  };

  return (

    <div className="App">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-5">AI Email Customer Support Demo</h2>
        <p className="text-gray-700 text-center mb-4">Enter a sample email and select a response type to get a response from the AI.</p>
        <div className='mb-4'>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="trainingRules">
            Training Rules
          </label>
          <textarea
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 h-40"
            id="trainingRules"
            value={trainingRules}
            onChange={(e) => setTrainingRules(e.target.value)}
            placeholder="Enter your training rules here" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="fromEmail">
            From Email
          </label>
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            id="fromEmail"
            type="text"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="Enter the from email here"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="prompt">
            Email Body
          </label>
          <textarea
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your email's body here"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="response-type">
            Response Tone
          </label>
          <select
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            id="response-type"
            value={responseType}
            onChange={(e) => setResponseType(e.target.value)}
          >
            {dropdownItems.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row">
          <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600" hidden={isLoading}>
            Submit
          </button>
        </div>
        <div className="">
          <Dna
            visible={isLoading === true}
            height="80"
            width="80"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
        </div>
      </form>
      <div className="bg-gray-100 p-6 rounded-lg leading-tight">
        <p className="text-gray-700" dangerouslySetInnerHTML={{__html: response}} />
      </div>
      <div className="mt-10">
        <p className="text-gray-700 mb-4 py-2 px-4">Connect to Gmail to begin watching inbox</p>
        <a href={`${process.env.SERVER_URL}:${process.env.SERVER_PORT}/auth`} className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 mx-5">Login with Gmail</a>
      </div>
    </div>
  );
}

export default App;