// This file is used to poll all users' email inboxes every 5 minutes that are stored in the MongoDB database.
const mongoose = require('mongoose');
const { google } = require('googleapis');

const userToken = require('./schema/userToken');
const email = require('./schema/email');

const { convert } = require('html-to-text');
const axios = require('axios');

require("dotenv").config();
const { MONGO_URI, MONGO_DB, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } = process.env;


// Connect to the MongoDB database
mongoose.set('strictQuery', false);
const connection = mongoose.connect(`${MONGO_URI}/${MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Polling Server Connected to MongoDB Atlas");


// Poll the email inboxes every 5 minutes
const cron = require("node-cron");
console.log("Starting cron job...");

cron.schedule("*/15 * * * * *", async () => {
  // Get all users from the database
  console.log("Polling emails...");
  const users = await userToken.find({}).exec();

  // Loop through each user
  for (const user of users) {
    console.log("Polling emails for user: " + user._id);

    console.log('Authenticating with Google...');
    // Authenticate with Google using the user's tokens
    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
    console.log('Initialized OAuth2Client...');

    oAuth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token
    });

    console.log('Authenticated with Google for user: ' + user._id);
    // Get the user's email inbox
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const result = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50
    });
    const messages = result.data.messages;

    // Loop through each email in the inbox
    for (const message of messages) {
      // Get the full email data
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      // Extract the subject from the headers
      const headers = email.data.payload.headers;
      const subjectHeader = headers.find(header => header.name === 'Subject');
      const subject = subjectHeader ? subjectHeader.value : '';
      const from = headers.find(header => header.name === 'From').value;
      const date = headers.find(header => header.name === 'Date').value;

      // Decode the body data from base64 format
      let body = '';
      if (email.data.payload.parts) {
        const firstPartWithData = email.data.payload.parts.find(part => part.body.data);
        if (firstPartWithData) {
          body = Buffer.from(firstPartWithData.body.data, 'base64').toString();
        }
      }

      body = convert(body, {
        wordwrap: 130
      });

      // Store traingRules into database for each email inbox that we are listening to
      const trainingRules = `you are customer support for a brand called PocketProjectr. the brand sells mini projectors that can be hooked up to any device with video output. please respond to the following email in a polite manner and if they are asking where their order is offer them a 20% discount code 20CODEOFF on another one and assure them that their order is on the way. make sure to let the customer know that we have indeed sent their order from our fulfilment center but the shipping company is at fault if they are asking about shipping or not recieving their order. let the customer know that if needed we will send another order to them to make sure they recieve their product after we hear back from Pitney Bowes if they are asking about shipping or not recieving their order. use the excuse that there was an issue with the shipping company and we are working to get an updated tracking number asap from them and we reached out to the shipping company, Pitney Bowes, on their behalf and opened a case with the company if they are asking about shipping or not recieving their order. if they are saying and item is defective or they would like to return, convince them that it may be user error. for the signature sign the email with "Best, John, PocketProjectr Support".`

    // Send the email to the GPT-3 API
    // Convert all the fields into 1 large string
    let responseEmail = '';
    if(from === 'PocketProjectr Support <info@pocketprojectr.com>') {
        console.log('Sending email to GPT-3 API...');
        try {
            const response = await axios.post('http://localhost:3001/ai', {
                prompt: `Subject: ${subject}\nBody: ${body}`,
                fromEmail: from,
                responseType: 'gen-z',
                trainingRules: trainingRules
              });

            responseEmail = response.data;
            responseEmail = convert(responseEmail, {
                wordwrap: 130
              });
          } catch (error) {
            console.error(error);
          }


        console.log('\n\n\n--------------------------------------------------------------------')
        const emailString = `From: ${from}\nDate: ${date}\nSubject: ${subject}\nBody: ${body}`;
        console.log(emailString);
        console.log('Message ID:' + message.id);
        console.log('\n\nResponse: ' + responseEmail)
        console.log('--------------------------------------------------------------------\n\n\n')
    }



    //   // Check if the email already exists in the database
    //   const emailExists = await emailsCollection.findOne({
    //     emailId: email.id,
    //     userId: user._id
    //   });

    //   // If the email doesn't exist, insert it into the database
    //   if (!emailExists) {
    //     await emailsCollection.insertOne({
    //       emailId: email.id,
    //       userId: user._id,
    //       subject: email.subject,
    //       body: email.body,
    //       date: email.date
    //     });
    //   }
    }

    // Refresh the user's tokens if necessary
    if (oAuth2Client.isTokenExpired()) {
      const newTokens = await oAuth2Client.refreshAccessToken();
      await usersCollection.updateOne({
        _id: new ObjectID(user._id)
      }, {
        $set: {
          accessToken: newTokens.credentials.access_token,
          refreshToken: newTokens.credentials.refresh_token
        }
      });
    }
  }
  });
}).catch((err) => {
    console.log(err.message);
});

process.on('SIGINT', function() {
    process.exit(0);
});
