// DEPENDENCIES
require('dotenv').config(); //for local development

const TOKEN = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
var unixTime = require('unix-time');
// const 


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

//for user to check where the bot is deployed, user input deploy then the bot return where he is currently deployed
//this is for development purpose
bot.onText(/\/deploy.*/, (msg, match) => {
    // console.log(msg);
    if (process.env.NODE_ENV === 'production') {
        bot.sendMessage(msg.chat.id, 'I am deployed on cloud, ready to serve you ;)');
    } else {
        bot.sendMessage(msg.chat.id, 'I am deployed locally, this means the developer is currently tinkering around with the bot\n\nlets hope it doesn\'t take too long ;)')
    }
});

//reminder
//user input /remind [yyyy-mm-dd hh:mm:ss followed by message] [another message with the same format], the bot will remind the user
//at the specified time with the message user inputted
bot.onText(/\/remind.*/, (msg, matchedMessage) => {0 
    var messageDateTimeRegex = /((\d{4})-(\d{1,2})-(\d{1,2}) (\d{2}):(\d{2}):(\d{2}))(.*[^\]])/gmi; //extract the date-time in format yyyy-mm-dd hh:mm:ss and the message reminder
    var serverTime = unixTime(Date.now()-1) //-1 to match msg.date, there's a difference of 1 seconds
    // console.log(msg.date)
    var extractedMessage = messageDateTimeRegex.exec(matchedMessage);
    // console.log(extractedMessage)

    //send message to user at the specified time
    var dateUserTarget = new Date(extractedMessage[2], extractedMessage[3] - 1, extractedMessage[4], extractedMessage[5], extractedMessage[6], extractedMessage[7]);
    var dateInUnix = unixTime(dateUserTarget);
    var message = extractedMessage[8];
    
    //workaround for server and user time difference
    var timeDelta = dateInUnix - msg.date;
    var dateTargetInServerTime = serverTime + timeDelta;

    const unixToDate = (timeInUnix) => {
        var newDate = new Date(timeInUnix * 1000);
        var year =newDate.getFullYear();
        var month =newDate.getMonth();
        var date =newDate.getDate();
        var hour =newDate.getHours();
        var min =newDate.getMinutes();
        var sec =newDate.getSeconds();
        var newNewDate = new Date(year, month, date, hour, min, sec)
        return newNewDate
    }

    if(timeDelta<0) {
        bot.sendMessage(msg.chat.id, "can't remind time of the past");
        console.log("\ndelta:",timeDelta,"\ndate in unix:",dateInUnix,"msg.date",msg.date)
    }
    else {
        bot.sendMessage(msg.chat.id, "noted, I'll remind you");

        console.log("\nunix schedule time:", dateTargetInServerTime, "unix server time:",serverTime)
        console.log("\nscheduled time:",unixToDate(dateTargetInServerTime),"server time:",unixToDate(serverTime))
        const job = schedule.scheduleJob(unixToDate(dateTargetInServerTime), function () {
            bot.sendMessage(msg.chat.id, message);
        });    
    }
    // console.log('date:',date, "unixtime:", unixTime(date))

});

//greet the user
bot.onText(/\/start.*/, (msg, match) => {
    let greetings = 'Hi there, type in format "/remind yyyy-mm-dd hh:mm:ss message here" to create a new reminder or "/help to list all available commands"';
    bot.sendMessage(msg.chat.id, greetings);
});

//list all bot available commands
bot.onText(/\/help/, (msg, match)=>{
    let commandList ="/start - start the bot\n/help -list all command\n/deploy -check whether the bot is online or not\n/remind yyyy-mm-dd hh:mm:ss message here - tell the bot to send you message at specified time"
    bot.sendMessage(msg.chat.id, commandList);
});





