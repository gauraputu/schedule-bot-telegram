require('dotenv').config();
const TOKEN = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const unixTime = require('unix-time');
const littleTime = require('little-time');


const options = {
    webHook: {
        /**  
         * Port to which you should bind is assigned to $PORT letiable
         * See: https://devcenter.heroku.com/articles/dynos#local-environment-letiables 
         */
        port: process.env.PORT
        /**
         * you do NOT need to set up certificates since Heroku provides
         * the SSL certs already (https://<app-name>.herokuapp.com)
         * Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
         */
    }
};

/**
 * Heroku routes from port :443 to $PORT
 * Add URL of your app to env letiable or enable Dyno Metadata
 * to get this automatically
 * See: https://devcenter.heroku.com/articles/dyno-metadata
 */

const url = process.env.HEROKU_URL;
let bot;

/**
 * check where the bot deployed and decide whether to use polling or webhook
 */
if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(TOKEN, options);
    bot.setWebHook(`${url}/bot${TOKEN}`);
    console.info('**** BOT initiated on cloud***** ');
} else {
    bot = new TelegramBot(TOKEN, { polling: true });
    console.info('**** BOT initiated locally***** ')
}

/* section below is for processing input from user */

/**
 * for user to check where the bot is deployed, user input deploy then the bot return where he is currently deployed
 * this is for development purpose
 */
bot.onText(/\/deploy.*/, (msg, match) => {
    if (process.env.NODE_ENV === 'production') {
        bot.sendMessage(msg.chat.id, 'I am deployed on cloud, ready to serve you ;)');
    } else {
        bot.sendMessage(msg.chat.id, 'I am deployed locally, this means the developer is currently tinkering around with the bot\n\nlets hope it doesn\'t take too long ;)')
    }
});

/**
 * reminder
 * user input /remind [yyyy-mm-dd hh:mm:ss followed by message] [another message with the same format], the bot will remind the user
 * at the specified time with the message user inputted
 */
bot.onText(/\/remind.*/, (msg, matchedMessage) => { 
    let messageDateTimeRegex = /((\d{4})-(\d{1,2})-(\d{1,2}) (\d{2}):(\d{2}):(\d{2}))(.*[^\]])/gmi; //extract the date-time in format yyyy-mm-dd hh:mm:ss and the message reminder
    let extractedMessage = messageDateTimeRegex.exec(matchedMessage);
    let dateUserTarget = new Date(extractedMessage[2], extractedMessage[3] - 1, extractedMessage[4], extractedMessage[5], extractedMessage[6], extractedMessage[7]);
    let dateTargetInUnix = unixTime(dateUserTarget);
    let message = extractedMessage[8];
    console.group("--------------remind--------------")
    console.log("msg.date:",msg.date,"\nextracted message:",extractedMessage);
    console.log("dateUserTarget:",dateUserTarget,"\ndateTargetInUnix:",dateTargetInUnix,"\nmessage:",message);
    console.groupEnd();

    /** workaround for server and user time difference
     * $time from user (unix)
     * $time to remind (date)
     * $server time (unix)
     * 
     * convert $time to remind to unix
     * get difference $time to remind unix with $time from user
     * add the difference to $server time
     * run scheduler
     */
    let timeDelta = dateTargetInUnix - msg.date;
    console.log("timeDelta:",timeDelta);

    const unixToDateConverter = (timeInUnix) => {
        let newDate = new Date(timeInUnix * 1000);
        let newNewDate = [newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds()]
        return newNewDate
    }

    if(timeDelta<0) {
        bot.sendMessage(msg.chat.id, "can't remind time of the past");
        console.error("\ndelta:",timeDelta,"\ndate target in unix:",dateTargetInUnix,"msg.date",msg.date)
    }
    else {
        bot.sendMessage(msg.chat.id, "noted, I'll remind you");
        let serverTimeTargetUnixFormat = timeDelta + unixTime(Date.now()-1);
        let serverTime = Date.now()-1;
        console.log("serverTimeTargetUnixFormat:",serverTimeTargetUnixFormat,"server time:", serverTime);
        let serverTimeTargetDateFormat = unixToDateConverter(serverTimeTargetUnixFormat);
        console.log("serverTimeTargetDateFormat:",serverTimeTargetDateFormat);
        let remindTime = new Date(serverTimeTargetDateFormat[0],serverTimeTargetDateFormat[1],serverTimeTargetDateFormat[2],serverTimeTargetDateFormat[3],serverTimeTargetDateFormat[4],serverTimeTargetDateFormat[5]);

        const job = schedule.scheduleJob(remindTime,function () {
            bot.sendMessage(msg.chat.id, message);
        });    
    }
});

/**
 * greet the user
 */
bot.onText(/\/start.*/, (msg, match) => {
    let greetings = 'Hi there, type in format "/remind yyyy-mm-dd hh:mm:ss message here" to create a new reminder or "/help to list all available commands"';
    bot.sendMessage(msg.chat.id, greetings);
});

/**
 * list all bot available commands 
 */
bot.onText(/\/help/, (msg, match)=>{
    let commandList ="/start - start the bot\n/help -list all command\n/deploy -check whether the bot is online or not\n/remind yyyy-mm-dd hh:mm:ss message here - tell the bot to send you message at specified time"
    bot.sendMessage(msg.chat.id, commandList);
});

bot.onText(/this is a test/, (msg,match)=>{
    bot.sendMessage(msg.chat.id, "helloh there!")
})

/** check server time now, this is for development only */

bot.onText(/\/time/, (msg, match)=>{
    const unixToDateConverter = (timeInUnix) => {
        let newDate = new Date(timeInUnix * 1000);
        let newNewDate = [newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds()]
        return newNewDate
    }
    let time = Date.now();
    let serverTime = unixToDateConverter(time);
    console.log(serverTime);
    bot.sendMessage(msg.chat.id, `server time now is: ${serverTime}, ${time}`)
})


