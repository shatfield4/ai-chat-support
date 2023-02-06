const OpenAI = require("openai-api");
const express = require("express");
const { google } = require('googleapis');

const mongoose = require("mongoose");
const userToken = require("./schema/userToken");



require("dotenv").config();
const { MONGO_URI, MONGO_DB, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI, OPENAI_API_KEY, SERVER_PORT } = process.env;


mongoose.set('strictQuery', false);
mongoose.connect(`${MONGO_URI}/${MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("API Connected to MongoDB Atlas")
}).catch((err) => {
    console.log(err.message);
});




const app = express();
const port = SERVER_PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*
oAuth2Client declaration
*/
const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

/*
@RETURN {String} - redirect to the Google OAuth page
*/
app.get('/auth', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly']
    });
    res.redirect(authUrl);
});

app.get('/callback', (req, res) => {
    const { code } = req.query;
    oAuth2Client.getToken(code, (err, tokens) => {
        if (err) return res.status(500).send(err);

        // Create a new user token object
        const UserToken = new userToken({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        });
        // Save the tokens to the database
        UserToken.save((error) => {
            if (error) return res.status(500).send(error);
            oAuth2Client.setCredentials(tokens);
            // res.redirect('/watch');

            // respond with a success message json
            res.status(200).json({ message: "Successfully logged in!" });

        });
    });
});





/*
@RETURN {String} - the list of emails
*/
app.get('/watch', (req, res) => {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const options = {
        userId: 'me',
        resource: {
            labelIds: ['INBOX'],
            topicName: 'projects/aisq-gmail-watch/topics/gmail'
        }
    };
    gmail.users.watch(options, (err, response) => {
        if (err) return res.status(500).send(err);
        const historyId = response.data.historyId;
        setInterval(() => {
            gmail.users.history.list({
                userId: 'me',
                startHistoryId: historyId
            }, (err, response) => {
                if (err) return res.status(500).send(err);
                try {
                  const messages = response.data.history;
                  messages.forEach(message => {
                      gmail.users.messages.get({
                        userId: 'me',
                        id: message.messages[0].id
                      }, (err, response) => {
                        if (err) return res.status(500).send(err);
                        const headers = response.data.payload.headers;
                        const from = headers.find(header => header.name === 'From');
                        const subject = headers.find(header => header.name === 'Subject');
                        const date = headers.find(header => header.name === 'Date');
                        let body = '';
                        if (response.data.payload.parts) {
                            response.data.payload.parts.forEach(part => {
                                if (part.parts) {
                                    part.parts.forEach(subpart => {
                                        if (subpart.body.data) {
                                            body += Buffer.from(subpart.body.data, 'base64').toString();
                                        }
                                    });
                                } else if (part.body.data) {
                                    body += Buffer.from(part.body.data, 'base64').toString();
                                }
                            });
                        }
                        console.log("From: " + from.value);
                        console.log("Subject: " + subject.value);
                        console.log("Date: " + date.value);
                        console.log("Body: " + body);
                      });
                  });
                } catch (e) {
                  console.log(e);
                  console.log(response);
                }
            });
        }, 5000);
    });
    res.send('Watching inbox for new emails.');
});


/*
@PARAMS {String} prompt - the prompt to use for the AI
@RETURN {String} - the generated text
*/
app.post("/ai", async (req, res) => {
    // console.log(req.body);
    const openai = new OpenAI(OPENAI_API_KEY); // create a new instance of the OpenAI class
    const { prompt, responseType, trainingRules, fromEmail } = req.body; // get the prompt from the request body
    const maxTokens = 300;                                 // set the max number of tokens to 100
    const temperature = 0.9;                               // set the temperature to 0.9 (randomness of the response)

    let responseTypePrompt = `respond in a tone of voice of ${responseType}`;
    let fullPrompt = `${responseTypePrompt} and ${trainingRules} write the response as html and do not use /n for line breaks, use <br>: from:${fromEmail}: do not continue the sentence, this is the full email: ${prompt}`;

    const openaiResponse = await openai.complete({
        engine: "text-davinci-003",                        // use the davinci engine
        prompt: fullPrompt,                                // set the prompt to the fullPrompt
        maxTokens,
        temperature,
    });
    res.send(openaiResponse.data.choices[0].text.replace(/[\n""]/g, ""));         // send the response to the client
});


app.listen(port, () => {
    console.log(`Express API backend listening at http://localhost:${port}`);
});


process.on('SIGINT', function() {
    process.exit(0);
});