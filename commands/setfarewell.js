// imports
const gd = require('../globaldata.js');
const {Message} = require('discord.js');
const hf = require('../helperfcns.js');
const {getAudioDurationInSeconds} = require('get-audio-duration');


module.exports = {
    name: 'setfarewell',
    description: 'Used for updating or setting your farewell. Use delfarewell to remove farewell entirely.',
    usage: 'setfarewell!farewell',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // Get discord id and check that it is valid
            let discordId = message?.author?.id;
            if(!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }

            // Get farewell from args and check that it is valid
            var farewell = args?.[0];
            if(!(farewell in gd.audioDict)) {
                return reject({ userMess: `"${farewell}" is not a valid farewell name. Check your spelling.`});
            }

            // Check that the duration is less than the allowed amount
            var duration = await getAudioDurationInSeconds(gd.audioDict[farewell]);
            if(duration >= gd.MAX_FAREWELL_CLIP_DURATION) {
                return reject({
                    userMess: `"${farewell}" has a duration of ${duration} sec. Max duration is ${gd.MAX_FAREWELL_CLIP_DURATION} sec. Talk to Kevin for exceptions to this rule.`
                });
            }            
            
            // Call set_farewell stored procedure
            try {
                let queryStr = `CALL set_farewell('${discordId}','${farewell}', @message); SELECT @message;`;
                let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                let rtnMess = results[1][0]['@message'];
                if (rtnMess === 'Success') {
                    return resolve({userMess: `Your farewell has been set to "${farewell}"!`});
                } else {
                    return reject({
                        userMess: "Failed to set farewell. Try again later or talk to Kevin.",
                        err: rtnMess
                    });
                }
            } catch (err) {
                return reject({
                    userMess: "Failed to set farewell. Try again later or talk to Kevin.",
                    err: err
                });
            }
        });
    }
};