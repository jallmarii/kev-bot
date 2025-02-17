// imports
const gd = require('./globaldata.js');
const Discord = require('discord.js');
const hf = require('./helperfcns');

// Ready event handler
async function onReady(){
    try {
        await gd.client.user.setAvatar(gd.avatarPath);
    } catch (err) {
        console.log(err);
    }
    await gd.client.user.setActivity("kev-bot | help!kb", {type: "PLAYING"});
    console.log(`Logged in as ${gd.client.user.tag}!`);
}

// Voice Status update handler
/**
 * @param {Discord.VoiceState} oldUserVoiceState
 * @param {Discord.VoiceState} newUserVoiceState
 */
async function onVoiceStateUpdate(oldUserVoiceState, newUserVoiceState){
    try {
        if (process.env.ENV === 'TEST') { return; } // do not run a command if the test environment is being used
        var newUserChannel = newUserVoiceState.channel;
        var oldUserChannel = oldUserVoiceState.channel;
        var newMember = newUserVoiceState.member;
        var oldMember = oldUserVoiceState.member;
        if(oldUserChannel === null && newUserChannel !== null && !newMember.user.bot) { // User Joins a voice channel
            var response = await gd.client.commands.get('getgreeting').execute({user : newMember.user});
            if (!response.greeting) {return;}
            let _discordId = newMember?.user?.id;
            if (!_discordId) {_discordId = '0';}            
            await gd.client.commands.get('p').execute({
                audio : response.greeting, 
                voiceChannel : newUserChannel,
                discordId : _discordId,
                playType : gd.PLAY_TYPE.GREETING
            });
        } else if(newUserChannel === null && oldUserChannel !== null && !oldMember.user.bot){ // User leaves a voice channel
            var response = await gd.client.commands.get('getfarewell').execute({user : oldMember.user});
            if (!response.farewell) {return;}
            let _discordId = oldMember?.user?.id;
            if (!_discordId) {_discordId = '0';}            
            await gd.client.commands.get('p').execute({
                audio : response.farewell, 
                voiceChannel : oldUserChannel,
                discordId : _discordId,
                playType : gd.PLAY_TYPE.FAREWELL
            });
        }
    } catch (err) {
        // Console logging
        console.error(err);
        // User response
        if (err.userMess) {
            newMember.user.send(err.userMess);
        } else {
            newMember.user.send(`Something went wrong! Talk to Kevin.`);
        }
    }
}

// Message handler
/**
 * @param {Discord.Message} message
 * @param {string} prefix
 */    
async function onMessage(message, prefix){
    try {
        // Return if the message does not start with the prefix or if the message was from a bot
        if (!message.content.startsWith(prefix) || message.author.bot || !message.content.includes('!')) {return;}

        // Get args and command name. Format of every command should follow "prefixcommand!arg1 arg2 arg3 arg4"
        const messageSplit = message.content.toLowerCase().slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
        var commandName = messageSplit[0]; // "command"
        var args = messageSplit[1] ? messageSplit[1].split(/ +/) : undefined; // array of the args ["arg1", "arg2", "arg3", "arg4"]  

        // Execute command if it exists
        if (gd.client.commands.has(commandName)) {
            let response = await gd.client.commands.get(commandName).execute({message : message, args : args});
            if (response?.userMess) {
                for (res of hf.breakUpResponse(response.userMess, '!@#', response.wrapChar || '')) {
                    await message.author.send(res);
                }
            }
        }
    } catch (err) {
        // Console logging
        let discordId = message?.author?.id;
        let commandAttempted = message;
        if (!discordId) { discordId = "undefined";}
        if (!commandAttempted) { commandAttempted = "undefined";}
        console.error(`DiscordID: "${discordId}". Command: "${commandAttempted}". Failed with err: `, err);

        // User response
        if (err.userMess) {
            if (err.userMess != 'SUPPRESS_GENERAL_ERR_MESSAGE') {message.author.send(err.userMess);}
        } else {
            if (commandName) {
                message.author.send(`There was an issue executing command "${commandName}"! Talk to Kevin.`);
            } else {
                message.author.send(`Something went wrong! Talk to Kevin.`);
            }
        }
    }
}


module.exports = {
    onReady,
    onVoiceStateUpdate,
    onMessage
}
    