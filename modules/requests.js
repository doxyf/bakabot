const request = require('request');
const {handle} = require('./handler.js');
const user = require('./user.js');
const embeds = require('./embeds.js');

function get(message, url, accesstoken, type){

    request.get(url,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer "+accesstoken
            }
        }, function(err, res, body){
            if(err) return console.error(err);

            switch (res.statusCode) {
                case 401:
                    updt(message, url, accesstoken, type, 0);
                    setTimeout(() => {
                        get(message, url, user.database[message.author.id].accesstoken, type); //!!! should be done better
                    }, 1000);
                    break;

                case 200:
                    handle(message, body, type);
                    break;

                case 404:
                    let bodyJson = JSON.parse(body)
                    if(bodyJson.Message){
                      message.reply({embeds: [embeds.error(`API: 404, Message: ${bodyJson.Message}`)]});
                    }else {
                      message.reply({embeds: [embeds.error(`API: Not found. (404)`)]});
                    };
                    break;

                default:
                    console.log('Unknown status code: '+statusCode.toString());
                    break;
            }

        }
    );
};

function post(message, url, accesstoken, type){
    request.get(url,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer "+accesstoken
            }
        }, function(err, res, body){
            if(err) return console.error(err);

            switch (res.statusCode) {
                case 401:
                    updt(message, url, accesstoken, type, 0);
                    setTimeout(() => {
                        get(message, url, user.database[message.author.id].accesstoken, type);
                    }, 1000);
                    break;

                case 200:
                    handle(message, body, type);
                    break;

                case 404:
                    let bodyJson = JSON.parse(body)
                    if(bodyJson.Message){
                      message.reply({embeds: [embeds.error(`API: 404, Message: ${bodyJson.Message}`)]});
                    }else {
                      message.reply({embeds: [embeds.error(`API: Not found. (404)`)]});
                    };
                    break;

                default:
                    console.log('Unknown status code: '+statusCode.toString());
                    break;
            }
        }
    );
};

function updt(message, url, accesstoken, type, method){
    user.updateToken(message, url, accesstoken, type, method)
};

module.exports = {
    get,
    post
};
