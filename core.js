const { Client, Intents } = require('discord.js');
const fs = require('fs');

const embeds = require('./modules/embeds.js');
const config = require('./config.json');

let user;

const client = new Client({
    partials: ["CHANNEL"],
    intents: [
       Intents.FLAGS.GUILDS,
       Intents.FLAGS.GUILD_MESSAGES,
       Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
       Intents.FLAGS.GUILD_INTEGRATIONS,
       Intents.FLAGS.DIRECT_MESSAGES,
       Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ]
});

client.on('ready', () => {
    console.log(`Ready @ ${client.guilds.cache.size} guilds.`);

    //Import the libs when the bot is ready.
    user = require('./modules/user.js');
    require('./modules/commands.js');

    client.user.setActivity('žáky lol', {type:'WATCHING'});
});

client.on('messageCreate', (message) => {
    if(!message.content.startsWith(config.prefix)) return;
    if(message.author.bot) return;
    logChat(message);

    switch (message.content) {
        case 'b>help':
        case 'b>pomoc':
            message.reply({embeds: [embeds.help()]});
            break;

        case 'b>register':
        case 'b>logout':
            break;
    
        default:
            if(message.channel.type != 'DM'){
                if(!user.database[message.author.id]) return message.reply({embeds: [embeds.noDB(message)]});
                if(!user.database[message.author.id].phase == 'success') return message.reply({embeds: [embeds.noDB(message)]});
            };
            break;
    };
});

function logChat(message){
    let date = new Date();

    let hours = date.getHours();
    if(date.getHours().toString().length == 1) hours = `0${date.getHours().toString()}`;
    let minutes = date.getMinutes();
    if(date.getMinutes().toString().length == 1) minutes = `0${date.getMinutes().toString()}`;
    let seconds = date.getSeconds();
    if(date.getSeconds().toString().length == 1) seconds = `0${date.getSeconds().toString()}`;

    let str = `[${hours}:${minutes}:${seconds}] [${message.channelId}@${message.guildId}] ${message.author.tag}: ${message.content}`;
    console.log(str);
    fs.appendFileSync(`./logs/${date.getDay()}.${date.getMonth()+1}.${date.getFullYear()}.txt`, `${str}\n`, 'utf-8');
};

function log(string){
    let date = new Date();

    let hours = date.getHours();
    if(date.getHours().toString().length == 1) hours = `0${date.getHours().toString()}`;
    let minutes = date.getMinutes();
    if(date.getMinutes().toString().length == 1) minutes = `0${date.getMinutes().toString()}`;
    let seconds = date.getSeconds();
    if(date.getSeconds().toString().length == 1) seconds = `0${date.getSeconds().toString()}`;

    let str = `[${hours}:${minutes}:${seconds}] ${string}`;
    console.log(str);
    fs.appendFileSync(`./logs/${date.getDay()}.${date.getMonth()+1}.${date.getFullYear()}.txt`, `${str}\n`, 'utf-8');
};

module.exports = {
    client,
    logChat,
    log
};

client.login(process.env.TOKEN || config.token);