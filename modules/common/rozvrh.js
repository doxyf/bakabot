const { MessageEmbed } = require('discord.js');
const request = require('request');
const user = require('../user.js');

module.exports = function getSubjects(message, rozvrhBody){

    request.get(`${user.database[message.author.id].url}/api/3/subjects`, 
    {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer "+user.database[message.author.id].accesstoken
        }
    }, function(err, res, body){
        if(err) return console.error('[ABORT] '+err.message);

        parse(message, rozvrhBody, body);
    });

};

function parse(message, rozvrhBody, predmetyBody){
    let rbodyJson = JSON.parse(rozvrhBody);
    let roomsParsed = parseRooms(rbodyJson.Rooms);
    let pbodyJson = JSON.parse(predmetyBody);

    let subjects = pbodyJson.Subjects
    let hours = rbodyJson.Hours

    let embedsArray = [];
    let days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
    let daypos = 0

    rbodyJson.Days.forEach(day => {
        let date = Date.parse(rbodyJson.Days[daypos].Date);
        let newdate = new Date(date);
        let dateStr = `${newdate.getDate()}.${newdate.getMonth()+1}.${newdate.getFullYear()}`
        let embed = new MessageEmbed().setTitle(`${days[daypos]} (${dateStr})`);
        daypos++

        day.Atoms.forEach(atom => {
            if(atom.Change){
                parseChange(embed, atom.Change, true);
            }else{
                embed.addField(getHour(hours, atom.HourId), `${getSubject(subjects, atom.SubjectId)} [${roomsParsed[atom.RoomId] || 'unk'}]`, true);
            }


        });
        embedsArray.push(embed);
    });

    message.channel.send({embeds: embedsArray});
};

function parseChange(embed, change){
    switch (change.ChangeType){
        case 'Canceled':
            embed.addField(change.Hours, 'Zrušeno', true);
            break;

        case 'Removed':
            embed.addField(change.Hours, 'Odebráno', true);
            break;
    
        default:
            embed.addField(change.Hours, 'Unknown change '+change.ChangeType, true);
            break;
    };
};

function getHour(hours, id){
    let i = 0
    for (i; i < hours.length; i++) {
        if(hours[i].Id && hours[i].Id.toString().includes(id)){
            break;
        };
    };
    
    if(hours[i] && hours[i].Caption) return `${hours[i].Caption}. (${hours[i].BeginTime}-${hours[i].EndTime})`
    return '-'
};

function getSubject(subjects, id){
    let i = 0
    for (i; i < subjects.length; i++) {
        if(subjects[i].SubjectID.includes(id)){
            break;
        };
    };
    
    if(subjects[i] && subjects[i].SubjectName) return subjects[i].SubjectName
    return '-'
};

function parseRooms(roomsJson){
    let result = {}

    roomsJson.forEach(room => {
        result[room.Id] = `${room.Abbrev}`;
    });

    return result;
}