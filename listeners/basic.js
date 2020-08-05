const connFactory = require('../util/connection-factory');
const logger = require('../util/logger');
const { getAccounts, getRequestURL} = require('../util/refedge');
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

    
    controller.on('block_actions',async function(bot, message) {
        console.log('block_actions');
        console.dir(message);
        // Account selected
        let existingConn = await connFactory.getConnection(message.team.id, controller);
        if (existingConn && message.actions != null) {
            console.dir(message.actions[0].selected_option);
            let requestURL = await getRequestURL(existingConn,message.actions[0].selected_option.value);
            await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
        } else {
            const authUrl = connFactory.getAuthUrl(message.team);
            await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
        }
    });

    controller.on(
        'direct_message',
        async (bot, message) => {

            try {
                console.log('message ***** ');
                console.dir(message);
                console.log('----message.nlpResponse.queryResult.outputContexts---------');
                console.dir(message.nlpResponse.queryResult.outputContexts);

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
                        console.log('58');
                        if (message.entities.Account == '') {
                            await bot.reply(message, message.fulfillment.text);
                        } else { 
                            let accounts = await getAccounts(existingConn,message.entities.Account);
                            console.log('accounts');
                            if (accounts == null || Object.keys(accounts).length == 0) {
                                await bot.reply(message, 'No Active Reference program member found by name:' + message.entities.Account + '. Please check the spelling or Activate the Account.');
                            } else if (Object.keys(accounts).length > 1) {
                                console.log('content');
                                /*const content = {
                                    "blocks" : [
                                  {
                                    "type": "section",
                                    "block_id": "section678",
                                    "text": {
                                      "type": "mrkdwn",
                                      "text": "Please select an account from the dropdown list"
                                    },
                                    "accessory": {
                                      "action_id": "accountSelect",
                                      "type": "multi_static_select",
                                      "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select items"
                                      },
                                      "options": accounts
                                    }
                                  }
                                ]};*/
                                const content = {
                                    "type": "modal",
                                    "submit": {
                                        "type": "plain_text",
                                        "text": "Submit",
                                        "emoji": true
                                    },
                                    "close": {
                                        "type": "plain_text",
                                        "text": "Cancel",
                                        "emoji": true
                                    },
                                    "title": {
                                        "type": "plain_text",
                                        "text": "Find Reference",
                                        "emoji": true
                                    },
                                    "blocks": [
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Ref Search.",
                                                "emoji": true
                                            }
                                        },
                                        {
                                            "type": "divider"
                                        },
                                        {
                                            "type": "input",
                                            "label": {
                                                "type": "plain_text",
                                                "text": "Select Ref Types",
                                                "emoji": true
                                            },
                                            "element": {
                                                "type": "multi_static_select",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select RefTypes",
                                                    "emoji": true
                                                },
                                                "options": accounts
                                            }
                                        }
                                    ]
                                }
                                console.dir(content);
                                await bot.reply(message, content);
                            } else if (Object.keys(accounts).length = 1) {
                                let requestURL = await getRequestURL(existingConn,accounts[Object.keys(accounts)[0]].value);
                                await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
                            } else {
                                await bot.reply(message, message.fulfillment.text);
                            }
                        }
                    } else if (!existingConn) {
                        const authUrl = connFactory.getAuthUrl(message.team);
                        await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                    } 
                } else if (message.nlpResponse != null && message.nlpResponse.queryResult != null && message.nlpResponse.queryResult.outputContexts != null && message.nlpResponse.queryResult.outputContexts.length > 0) {
                    let isCR = false;
                    console.log('message.nlpResponse');
                    for (var val of message.nlpResponse.queryResult.outputContexts) {
                        console.log(val);
                        console.dir(val);
                        /*if (val.name.includes('create_request')) {
                            isCR = true;
                            break;
                        }*/
                    }

                    if (isCR) {
                        let accounts = await getAccounts(existingConn,message.text);
                                
                        if (accounts == null || Object.keys(accounts).length == 0) {
                            await bot.reply(message, 'No Active Reference program member found by name:' + message.entities.Account + '. Please check the spelling or Activate the Account.');
                        } else if (Object.keys(accounts).length > 1) {
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
                                    "action_id": "accountSelect",
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
                        } else if (Object.keys(accounts).length = 1) {
                            let requestURL = await getRequestURL(existingConn,accounts[Object.keys(accounts)[0]].value);
                            await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
                        } 
                    } else {
                        await bot.reply(message, message.fulfillment.text);
                    }
                } else {
                    bot.say("Hello");
                }
            } catch (err) {
                logger.log(err);
            }
        }
    );

    controller.on(
        'slash_command',
        async (bot, message) => {

            try {
                console.log('nlp response----slash_command ***** ');
                console.dir(message);
                bot.replyPublic(message,'we got the payload');
            } catch (err) {
                logger.log(err);
            }
        }
    );

    controller.on('oauth_success', async authData => {
        console.log('******************-----/oauth_success/-----******************');
        console.log('-----/authData/-----')
        console.dir(authData)
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
            console.log('-----/existingTeam/-----');
            console.dir(existingTeam);

            if (isNew) {
                let bot = await controller.spawn(authData.team_id);
                console.log('-----/bot/-----');
                console.dir(bot);
                controller.trigger('create_channel', bot, authData);
                controller.trigger('onboard', bot, authData.user_id);
            }
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('onboard', async (bot, userId) => {
        await bot.startPrivateConversation(userId);
        console.log('******************-----/onboard/-----******************');
        console.log('-----/userId/-----');
        console.log(userId);
        await bot.say('Hello, I\'m REbot.');
    });

    controller.on('create_channel', async (bot, authData) => {
        console.log('******************-----/create_channel/-----******************');
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
            console.log('-----/crpTeamChannel/-----');
            console.dir(crpTeamChannel);
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