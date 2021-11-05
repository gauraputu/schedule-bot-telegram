# schedule-bot telegram
- - -
a telegram bot to remind you of your schedule so you don't forgot about it again. The real power comes in telegram group. or so it is intended to built for.

for now it just a prototype, command installed

`/remind [yyyy-mm-dd hh:mm:ss hellow world] `
tell the bot to send message hellow world at the time and date specified in the bracked

`deploy`
tell the bot to send message where he is currently being deployed.
I made this for development purpose but I realized that when I deploy it manually, heroku would stop deploy it, so I need repush some changes to trigger a re-deploy on heroku
another problem is when being deployed locally, sometimes the polling message just stopped working for whatever reason and I had to restart it.

`/sum 2 3 4 56`
tell the bot to reply with the sum of all numbers. I just copy paste this at first to learn how to built the bot and haven't bothered yet to remove it.
