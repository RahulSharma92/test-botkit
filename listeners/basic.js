const connFactory = require('../util/connection-factory');
const logger = require('../util/logger');
const { getAccounts } = require('../util/refedge');
const { BotkitConversation } = require('botkit');

const { checkTeamMigration } = require('../listeners/middleware/migration-filter');

module.exports = controller => {

    /*let convo = new BotkitConversation('my_dialog_1', controller);
    convo.ask('What is your name?', [], 'name');
    convo.ask('What is your age?', [], 'age');
    convo.ask('What is your favorite color?', [], 'color');
    convo.after(async(results, bot) => {
        console.log(results);
        await bot.say('conversation complete!');
    });
    controller.addDialog(convo);*/

    

    controller.on(
        'direct_message',
        async (bot, message) => {

            try {
                console.log('nlp response----');
                console.dir(message)
                console.log('message.intent');
                console.log(message.intent)
                console.log('message.entities');
                console.log(message.entities);
                console.log('message.fulfillment');
                console.log(message.fulfillment);

                if (message.intent === 'connect_to_sf') {
                    let existingConn = await connFactory.getConnection(message.team, controller);

                    if (!existingConn) {
                        const authUrl = connFactory.getAuthUrl(message.team);
                        await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                    } else {
                        await bot.beginDialog('sf_auth');
                    }
                } else if (message.intent === 'create_request') {
                    let existingConn = await connFactory.getConnection(message.team, controller);
                    
                    if (existingConn) {
                        
                        if (message.entities.Account == '') {
                            await bot.reply(message, message.text);
                        } else { 
                            let accounts = await getAccounts(existingConn,message.entities.Account);
                            console.log('4 After GetAccounts ');
                            console.dir(accounts);
                            if (accounts == null) {
                                await bot.reply(message, 'No Active reference program member found by name:' + message.entities.Account);
                            } else if (Object.keys(accounts).length > 1) {
                                console.log('5 After After GetAccounts ' + accounts);
                                const content = {
                                    "blocks" : [
                                  {
                                    "type": "section",
                                    "block_id": "section678",
                                    "text": {
                                      "type": "mrkdwn",
                                      "text": "Please select an account from the dropdown list"
                                    },
                                    "accessory": {
                                      "action_id": "text1234",
                                      "type": "static_select",
                                      "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select an item"
                                      },
                                      "options": accounts
                                    }
                                  }
                                ]};
                                await bot.reply(message, content);
                            } else {
                                await bot.reply(message, message.text);
                            }
                        }
                    } else if (!existingConn) {
                        const authUrl = connFactory.getAuthUrl(message.team);
                        await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                    } 
                } else {
                    bot.say("Hello");
                }
            } catch (err) {
                logger.log(err);
            }
        }
    );
    controller.on('block_actions', async function(bot, message) {
        try {
            console.log('block_actions');
            console.dir(message);
            await bot.reply(message, message.text);
        } catch (err) {
            logger.log(err);
        }
    });
    controller.on('message_actions', async function(bot, message) {
        try {
            console.log('message_actions');
            console.dir(message);
            await bot.reply(message, message.text);
        } catch (err) {
            logger.log(err);
        }
    });
    controller.on('interactive_message_callback',async function(bot, message) {

        console.log('interactive_message_callback');
        console.dir(message);
        await bot.reply(message, message.text);
    
    });

    controller.on('oauth_success', async authData => {

        try {
            let existingTeam = await controller.plugins.database.teams.get(authData.team_id);
            let isNew = false;

            if (!existingTeam) {
                isNew = true;
                existingTeam = {
                    id: authData.team_id,
                    name: authData.team_name,
                    is_migrating: false
                };
            }
            existingTeam.bot = {
                token: authData.bot.bot_access_token,
                user_id: authData.bot.bot_user_id,
                app_token: authData.access_token,
                created_by: authData.user_id
            };
            await controller.plugins.database.teams.save(existingTeam);

            if (isNew) {
                let bot = await controller.spawn(authData.team_id);
                controller.trigger('create_channel', bot, authData);
                controller.trigger('onboard', bot, authData.user_id);
            }
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('onboard', async (bot, userId) => {
        await bot.startPrivateConversation(userId);
        await bot.say('Hello, I\'m REbot.');
    });

    controller.on('create_channel', async (bot, authData) => {

        try {
            let result = await bot.api.channels.join({
                token: authData.access_token,
                name: '#crp_team'
            });
            const crpTeamChannel = {
                id: result.channel.id,
                name: result.channel.name,
                team_id: authData.team_id
            };
            await controller.plugins.database.channels.save(crpTeamChannel);
        } catch (err) {
            console.log('error setting up crp_team channel:', err);
        }
    });

    controller.on('app_uninstalled', async (ctrl, event) => {

        try {
            const channels = await controller.plugins.database.channels.find({ team_id: event.team_id });

            if (channels && channels.length > 0) {
                await controller.plugins.database.channels.delete(channels[0].id);
            }
            await controller.plugins.database.teams.delete(event.team_id);
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('post-message', reqBody => {

        reqBody.messages.forEach(async msg => {

            try {
                let teamIdsArray = reqBody.teamId.split(',');
                const teams = await controller.plugins.database.teams.find({ id: { $in: teamIdsArray } });

                if (!teams) {
                    return logger.log('team not found for id:', reqBody.teamId);
                }

                for (let index = 0, len = teams.length; index < len; index++) {
                    const isTeamMigrating = await checkTeamMigration(teams[index].id, controller);

                    if (!isTeamMigrating) {
                        const bot = await controller.spawn(teams[index].id);

                        if (msg.userEmail) {
                            const userData = await bot.api.users.lookupByEmail({
                                token: teams[index].bot.token,
                                email: msg.userEmail
                            });

                            if (!userData || !userData.user) {
                                return logger.log('user not found in team ' + teams[index].id + ' for email:', msg.userEmail);
                            }
                            await bot.startPrivateConversation(userData.user.id);
                            await bot.say(msg.text);
                        } else {
                            const channels = await controller.plugins.database.channels.find({ team_id: teams[index].id });

                            if (channels && channels.length > 0) {
                                await bot.startConversationInChannel(channels[0].id);
                                await bot.say(msg.text);
                            }
                        }
                    } else {
                        logger.log(`cannot post message for team id ${teams[index].id}, this team is in migration `);
                    }
                }
            } catch (err) {
                logger.log(err);
            }
        });
    });

}