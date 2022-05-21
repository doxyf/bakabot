const { MessageEmbed } = require('discord.js');
const ems = require('enhanced-ms');

const config = require('../config.json');
const pr = config.prefix;

function regEmbed(message, phase){
    const embed = new MessageEmbed()
    .setColor('GREEN');

    switch (phase) {
        case 1:
            embed.addField(`Registrace uživatele ${message.author.tag}`, 'Zadej url s Bakaláři systémem:');
            break;

        case 2:
            embed.addField(`Registrace uživatele ${message.author.tag}`, 'Podařilo se! Nyní zadej svoje údaje (ve formátu login:heslo):');
            break;

        case 3:
            embed.addField(`Registrace uživatele ${message.author.tag}`, 'Povedlo se! Údaje můžeš kdykoliv odstranit z naší databáze pomocí !logout');
            break;

        case 0:
            embed.addField(`Odhlášení uživatele ${message.author.tag}`, 'Uživatel odstraněn z naší databáze.');
            break;
    
        default:
            break;
    };

    return embed;
};

function help(){
    const embed = new MessageEmbed()
    .setTitle('Prefix je b>')
    .setColor('RANDOM')
    .addFields(
        {name: `${pr}register`, value: 'Zaregistruje tě do naší databáze - Potřeba pro fungování bota.'},
        {name: `${pr}logout`, value: 'Odstraní tě z naší databáze, pro opětovné používání bota se bude potřeba znovu zaregistrovat.'},
        {name: `${pr}rozvrh`, value: 'Zobrazí tvůj aktuální rozvrh.'},
        {name: `${pr}ukoly`, value: 'Zobrazí tvoje aktuální úkoly.'},
        {name: `${pr}absence`, value: 'Zobrazí tvoje absence.'},
        {name: `${pr}info`, value: 'Zobrazí informace o botovi.'},
    )
    .setFooter({text: 'Vytvořil Foxy#8956'})
    .setTimestamp();
    return embed;
};

function success(str){
    const embed = new MessageEmbed()
    .setColor('GREEN');
    embed.addField('\\✅ |'+str);
    return embed;
};

function error(str){
    const embed = new MessageEmbed()
    .setColor('RED');
    embed.setTitle('\\❌ | '+str);
    return embed;
};

function noDB(message){
    const embed = new MessageEmbed()
    embed.addField(`Užvatel ${message.author.tag} není v naší databázi.`, `Pro zaregistrování do naší databáze prosím použij b>register`);
    embed.setColor('RED');
    return embed;
};

function info(count, ping, uptime, version, guildsize){
    const embed = new MessageEmbed()
    .setTitle('Info')
    .setColor('RANDOM')
    .addFields(
        {name: `Počet uživatelů v databázi: `, value: count.toString()},
        {name: `Latence (ping): `, value: `Discord gateway/API: ${ping.toString()}ms`},
        {name: `Počet serverů, na kterých se bot nachází: `, value: guildsize.toString()},
        {name: `Doba provozu (uptime): `, value: `Core: ${ems(uptime)}`},
        {name: `Podporovaná verze API: `, value: 'Verze 3 (v3)'},
        {name: `Verze NodeJS: `, value: process.version.slice(1)},
    )
    .setFooter({text: `Verze ${version.toString()} | by Foxy#8956`})
    .setTimestamp();
    return embed;
};

module.exports = {
    regEmbed,
    help,
    error,
    success,
    noDB,
    info
}