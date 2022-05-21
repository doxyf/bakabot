const fs = require('fs');
const core = require('../core.js');
const requests = require('./requests.js');
const user = require('./user.js');
const embeds = require('./embeds.js');
const config = require('../config.json');

core.client.on('messageCreate', message => {
    if(message.author.bot) return;
    if(!user.database[message.author.id]) return;
    if(!user.database[message.author.id].phase == "success") return;

    switch (message.content.toLowerCase()) {
        case 'b>absence':
            requests.get(message, user.database[message.author.id].url+'/api/3/absence/student', user.database[message.author.id].accesstoken, 0);
            break;

        case 'b>gdpr':
            message.channel.send({embeds: [embeds.error('Z důvodu ochrany soukromí tyto informace neposkytujeme.')]});
            break;

        case 'b>ukoly':
        case 'b>úkoly':
            requests.get(message, user.database[message.author.id].url+'/api/3/homeworks', user.database[message.author.id].accesstoken, 1);
            break;

        case 'b>rozvrh':
            const date = new Date();
            requests.get(message, user.database[message.author.id].url+`/api/3/timetable/actual?date=${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, user.database[message.author.id].accesstoken, 2);
            break;

        case 'b>info':
            const databaseraw = fs.readFileSync('./database.json', 'utf-8')
            const database = JSON.parse(databaseraw);

            let count = Object.keys(database).length
            message.reply({embeds: [embeds.info(count, core.client.ws.ping, core.client.uptime, config.version, core.client.guilds.cache.size)]});
            break;
    
        default:
            break;
    };
});