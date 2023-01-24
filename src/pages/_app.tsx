import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react';
import axios from 'axios';
import { Dna } from 'react-loader-spinner';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseType, setResponseType] = useState('');

  const dropdownItems = ['Gen-z', 'Formal', 'Natural Human with slang', 'Natural Human without slang', 'Robot response'];

  const handleLogin = async () => {
    axios.get('http://localhost:3000/auth')
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
    const response = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt: prompt,
        responseType: responseType}),
    });
    const text = await response.text();
    setResponse(text);
    setIsLoading(false);
  };

  return (

    <div className="App">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="prompt">
            Support Bot
          </label>
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="response-type">
            Response Type
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
        {/* <p className="text-gray-700">{response}</p> */}
        <p className="text-gray-700" dangerouslySetInnerHTML={{__html: response}} />
      </div>

      {/* <div dangerouslySetInnerHTML={{__html: htmlString}} /> */}
      <div className="mt-10">
        <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 mx-5" onClick={handleLogin}>
          Login with Gmail
        </button>
      </div>
    </div>
  );
}

export default App;