const absence = require('./common/absence.js');
const ukoly = require('./common/ukoly.js');
const rozvrh = require('./common/rozvrh.js');

function handle(message, body, type){
    switch (type) {
        case 0:
            absence(message, body);
            break;

        case 1:
            ukoly(message, body);
            break;

        case 2:
            rozvrh(message, body);
            break;
    
        default:
            break;
    }
};

module.exports = {
    handle
}