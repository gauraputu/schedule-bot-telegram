// DEPENDENCIES
require('dotenv').config(); //for local development

const TOKEN = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const Cron = require("croner"); //for scheduling


const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};
// Heroku routes from port :443 to $PORT
// Add URL of your app to env variable or enable Dyno Metadata
// to get this automatically
// See: https://devcenter.heroku.com/articles/dyno-metadata
const url = process.env.HEROKU_URL;
var bot;
//check where the bot deployed
if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(TOKEN, options);
    bot.setWebHook(`${url}/bot${TOKEN}`);
    console.log('**** BOT initiated on cloud***** ');
} else {
    bot = new TelegramBot(TOKEN, { polling: true });
	console.log('**** BOT initiated locally***** ')
}

//sum user input
bot.onText(/^\/sum((\s+\d+)+)$/, function (msg, match) {
    var result = 0;
    match[1].trim().split(/\s+/).forEach(function (i) {
        result += (+i || 0);
    })
    bot.sendMessage(msg.chat.id, result).then(function () {
        // reply sent!
    });
});

bot.on('message', function onMessage(msg) {
	bot.sendMessage(msg.chat.id, 'I am alive');
});

// var chatId = [];
// bot.onText(/\/start/),function(msg, match){
// 	chatId.push(msg.chat.id);
// 	bot.sendMessage(msg.chat.id, 'saved');
// 	console.log(chatId);
// }

// Cron('0,10,20,30,40,50,59 * * * * *',() => {
// 	console.log('This will run every 10 second');
// 	console.log(chatId);
// 	for(let i=0;i<chatId.length;i++){
// 		bot.sendMessage(chatId[i], "mass sending")
// 	}
// });





