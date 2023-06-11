const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const fs = require('fs');

const { Configuration, OpenAIApi } = require("openai");


var useGpt3 = false;//cheeper ai model than chatgpt




const data1 = fs.readFileSync(".key", 'utf8');
  console.log('File contents prePrompt:');
  console.log(data1);
var OPENAI_API_KEY = data1;


const data = fs.readFileSync('gptPrompt.txt', 'utf8');
  console.log('File contents prePrompt:');
  console.log(data);
var prePrompt = data;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);




let conversationHisory = prePrompt;

//////////////////////////////




const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));



app.use(express.static('public'));

io.on("connection", (socket) => {
    console.log(`[[connect ${socket.id}]]`);


socket.on('clientRequest', async message => {

      console.log(message);
      conversationHisory += "User: "+ message + "\n";
      conversationHisory += "Language Bot: ";

      var responseText = "";

     if(useGpt3){


      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: conversationHisory,
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      responseText = response.data.choices[0].text;


      }else{
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",//chatgpt
        messages: [{role: "user", content: conversationHisory}],
        max_tokens: 50,
        temperature: 1,
      });
      responseText = completion.data.choices[0].message.content;
      }
      console.log(responseText);
      conversationHisory += responseText + "\n";
      socket.emit('serverResponse',responseText );

    });

    socket.on("disconnect", (reason) => {
        console.log(`[[disconnect ${socket.id} due to ${reason}]]`);
    });
});
