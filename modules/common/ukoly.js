const { MessageEmbed } = require('discord.js');

module.exports = function absence(message, body){
    const bodyJson = JSON.parse(body);

    const embed = new MessageEmbed();

    if(bodyJson.Homeworks.length == 0){
        embed.setTitle('Žádné úkoly');
    }else{
        bodyJson.Homeworks.forEach(homework => {
            embed.addField(homework.Subject.Name, homework.Content);
        });
    };

    message.channel.send({embeds: [embed]});
};