const { MessageEmbed } = require('discord.js');

module.exports = function absence(message, body){
    const bodyJson = JSON.parse(body);

    let unsolved = 0
    let ok = 0
    let missed = 0
    let late = 0
    let soon = 0
    let school = 0
    let dt = 0

    bodyJson.Absences.forEach(absence => {
        unsolved = unsolved + absence.Unsolved
        ok = ok + absence.Ok
        missed = missed + absence.Missed
        late = late + absence.Late
        soon = soon + absence.Soon
        school = school + absence.School
        dt = dt + absence.DistanceTeaching
    });

    const embed = new MessageEmbed()
    .setTitle('Absence žáka '+message.author.tag)
    .addFields(
        {name: `Absence žáka`, value: unsolved.toString(), inline: true },
        {name: `Omluvené absence`, value: ok.toString(), inline: true },
        {name: `Neomluvené hodiny`, value: missed.toString(), inline: true },
        {name: `Pozdní příchody`, value: late.toString(), inline: true },
        {name: `Brzké odchody`, value: soon.toString(), inline: true },
        {name: `Nezapočtené absence`, value: school.toString(), inline: true },
        {name: `Distanční výuka`, value: dt.toString(), inline: true },
    )
    .setFooter({text: `Celkem ${bodyJson.PercentageThreshold} %`});
    message.channel.send({embeds: [embed]});
};