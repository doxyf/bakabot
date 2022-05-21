const request = require('request');
const fs = require('fs');

const core = require('../core.js');
const embeds = require('./embeds.js');

var databaseraw = fs.readFileSync('./database.json', 'utf-8')
var database = JSON.parse(databaseraw);

core.client.on('messageCreate', message => {
    if(message.author.bot) return;
    if(message.channel.type == 'DM') return registration(message);

    switch (message.content) {
        case 'b>register':
            beginRegistration(message);
            break;

        case 'b>logout':
            logout(message);
            break;
    
        default:
            break;
    };
});

function registration(message){
    if(!database[message.author.id]) return;

    switch (database[message.author.id].phase){
        case 1:
            checkURL(message);
            break;

        case 2:
            creds(message);
            break;

        case 'success':
            if(message.content.includes('logout')) logout(message);
            break;
    
        default:
            break;
    }
    
};

function beginRegistration(message){
    if(database[message.author.id]) return message.reply({embeds: [embeds.error('Uživatel je již registrovaný, nebo registrace právě probíhá.')]});
    try {
        message.author.send({embeds: [embeds.regEmbed(message, 1)]});
        message.react('✅');

        database[message.author.id] = {phase: 1}
        updateDB();
    } catch (e){
        message.reply('Nelze poslat soukromou zprávu uživateli:', e.message);
    };
};

function checkURL(message){
    const regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);

    if(message.content.match(regex)){
        request.get(`${message.content}/api/3`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }, 
        
        function (err, resp, body){
            if(err) return message.reply({embeds: [embeds.error(`Nastala chyba: ${err.message}`)]});

            if(resp.statusCode == 200){

                try {
                    JSON.parse(body);
                } catch (e) {
                    return message.reply({embeds: [embeds.error('API vrátilo neplatnou formu odpovědi. (Content-Type)')]});
                };

                let bodyJson = JSON.parse(body);
                core.log(`New registration: [${message.author.tag}@${message.content}] Response: ${body}`);

                if(bodyJson.ApiVersion && bodyJson.ApplicationVersion && bodyJson.BaseUrl){

                    if(bodyJson.ApiVersion.toString().startsWith('3.')){
                        database[message.author.id] = {phase: 2, url: message.content}
                        updateDB();
                        message.reply({embeds: [embeds.regEmbed(message, 2)]});

                    }else return message.reply({embeds: [embeds.error('API je zastaralé, nebo obsahuje neplatnou verzi. Podporovaná verze je v3. Zkus to znovu, zkontroluj překlepy.')]});

                }else return message.reply({embeds: [embeds.error('API vrátilo neplatnou odpověď.')]});

            }else return message.reply({embeds: [embeds.error('Nelze ověřit identitu Bakalářů na této stránce. Zkus to znovu, zkontroluj překlepy.')]});
        });

    }else return message.reply({embeds: [embeds.error('Neplatná URL adresa. Zkus to znovu, zkontroluj překlepy.')]});
};

function creds(message){
    let args = message.content.split(':');
    if(!args[0]) return message.reply({embeds: [embeds.error('Chybí jméno')]});
    if(!args[1]) return message.reply({embeds: [embeds.error('Chybí heslo')]});

    request.post(`${database[message.author.id].url}/api/login`,
    {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        form: {
            client_id: 'ANDR',
            grant_type: 'password',
            username: args[0],
            password: args[1]
        }
    },

    function (err, res, body){
        if(err) return message.reply({embeds: [embeds.error(`Ajaj, něco se pokazilo. Chypa: ${err.message}`)]});

        if(res.statusCode == 200){

            database[message.author.id].username = args[0]
            database[message.author.id].password = args[1]
            database[message.author.id].phase = 'success'
            database[message.author.id].accesstoken = JSON.parse(body).access_token
            database[message.author.id].expires = Math.floor(+new Date() / 1000) + parseInt(JSON.parse(body).expires_in);

            updateDB();
            message.reply({embeds: [embeds.regEmbed(message, 3)]});
        }else if(res.statusCode == 400){
            message.reply({embeds: [embeds.error(`Nelze ověřit přihlašovací údaje: ${JSON.parse(body).error_description}`)]});
        };
    });
};

function updateToken(message){

    request.post(`${database[message.author.id].url}/api/login`,
    {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        form: {
            client_id: 'ANDR',
            grant_type: 'password',
            username: database[message.author.id].username,
            password: database[message.author.id].password
        }
    },

    function (err, res, body){
        if(err) return console.error('Ajaj, něco se pokazilo. Chypa: '+err.message);

        if(res.statusCode == 200){

            database[message.author.id].accesstoken = JSON.parse(body).access_token
            database[message.author.id].expires = Math.floor(+new Date() / 1000)+parseInt(JSON.parse(body).expires_in);
            database[message.author.id].phase = 'success'

            updateDB();
            core.log(`[${message.author.tag}]: Token update`);
        }else if(res.statusCode == 401){
            console.log('Nelze ověřit přihlašovací údaje: '+JSON.parse(body).error_description);
        };
    });
};

function logout(message){
    if(database[message.author.id]){
        delete database[message.author.id]
        message.reply({embeds: [embeds.regEmbed(message, 0)]});
        updateDB();
    }else{
        message.reply({embeds: [embeds.error('Uživatel '+message.author.tag+' se v naší databázi nenachází.')]});
    }
};

function updateDB(){
    try {
        fs.writeFileSync('./database.json', JSON.stringify(database));   
    } catch (e) {
        console.log('[ERROR WHILE UPDATING DATABASE FILE]', e.message);
    };
};

module.exports = {
    updateDB,
    creds,
    updateToken,
    database,
};