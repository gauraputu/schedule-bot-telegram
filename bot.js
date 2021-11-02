// DEPENDENCIES
require('dotenv').config(); //for local development

const TOKEN = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');


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
    console.log(match);
    match[1].trim().split(/\s+/).forEach(function (i) {
        result += (+i || 0);
    })
    bot.sendMessage(msg.chat.id, result)
});

//for user to check where the bot is deployed
bot.onText(/.*deploy.*/, (msg, match) => {
    // console.log(msg);
    if (process.env.NODE_ENV === 'production') {
        bot.sendMessage(msg.chat.id, 'I am deployed on cloud');
    } else {
        bot.sendMessage(msg.chat.id, 'I am deployed locally')
    }
});

//reminder
bot.onText(/\/remind.*/, (msg, match) => {
    var extractMessageRegex = /\[(.*?)\]/gmi; //extract message that is inside []
    var messageRegex = /(\d{4})-(\d{1,2})-(\d{1,2}) (\d{2}):(\d{2}):(\d{2})(.*)/gmi; //extract the date-time and the message

    var extractMessage = match[0].match(extractMessageRegex);
    for (let i = 0; i < extractMessage.length; i++) {
        extractMessage[i] = extractMessage[i][0].match(messageRegex);
    }
    // console.log(match[0]);
    console.log(extractMessage);

    bot.sendMessage(msg.chat.id, "noted, I'll remind you");

    // for (let i = 0; i < extractMessage.length; i++) {
    //     let date = new Date(extractMessage[i][1], extractMessage[i][2] - 1, extractMessage[i][3], extractMessage[i][4], extractMessage[i][5], extractMessage[i][6]);
    //     let message = extractMessage[i][7];

    //     job(date,(message));
    // }

});








