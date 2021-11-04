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

//check where the bot deployed and decide whether to use polling or webhook
if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(TOKEN, options);
    bot.setWebHook(`${url}/bot${TOKEN}`);
    console.log('**** BOT initiated on cloud***** ');
} else {
    bot = new TelegramBot(TOKEN, { polling: true });
    console.log('**** BOT initiated locally***** ')
}

/* section below is for processing input from user */

//sum number, user input /sum followed by digit separated by space, the bot will return the sum of all digits
bot.onText(/^\/sum((\s+\d+)+)$/, function (msg, match) {
    var result = 0;
    console.log(match);
    match[1].trim().split(/\s+/).forEach(function (i) {
        result += (+i || 0);
    })
    bot.sendMessage(msg.chat.id, result)
});

//for user to check where the bot is deployed, user input deploy then the bot return where he is currently deployed
//this is for development purpose
bot.onText(/.*deploy.*/, (msg, match) => {
    // console.log(msg);
    if (process.env.NODE_ENV === 'production') {
        bot.sendMessage(msg.chat.id, 'I am deployed on cloud');
    } else {
        bot.sendMessage(msg.chat.id, 'I am deployed locally')
    }
});

//reminder
//user input /remind [yyyy-mm-dd hh:mm:ss followed by message] [another message with the same format], the bot will remind the user
//at the specified time with the message user inputted
bot.onText(/\/remind.*/, (msg, match) => {
    var extractMessageRegex = /\[(.*?)\]/gmi; //extract message that is inside [] ,included bracket
    var messageDateTimeRegex = /((\d{4})-(\d{1,2})-(\d{1,2}) (\d{2}):(\d{2}):(\d{2}))(.*[^\]])/gmi; //extract the date-time in format yyyy-mm-dd hh:mm:ss and the message reminder
    // console.log(match)

    var extractedMessage = extractMessageRegex.exec(match[0]);
    // console.log(extractedMessage)

    var remindMessageList = []; //format as [[message 1],[message 2],...]

    //below will return [[original string, match capture group 1,match capture group 2,....]]
    for (let i = 0; i < extractedMessage.length; i++) {
        remindMessageList[i]=(messageDateTimeRegex.exec(extractedMessage[i]));
        // console.log(remindMessageList[i]);
    }
    console.log(remindMessageList);

    bot.sendMessage(msg.chat.id, "noted, I'll remind you");

    for (let i = 0; i < remindMessageList.length; i++) {
        // console.log(remindMessageList[i])
        var date = new Date(remindMessageList[i][2], remindMessageList[i][3] - 1, remindMessageList[i][4], remindMessageList[i][5], remindMessageList[i][6], remindMessageList[i][7]);
        var message = remindMessageList[i][8];
        // console.log('date:',date,'message:',message)

        const job = schedule.scheduleJob(date, function(){
            bot.sendMessage(msg.chat.id, message);
            // console.log(message);
          });
    }

});








