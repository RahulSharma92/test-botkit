const connFactory = require('../util/connection-factory');
const logger = require('../util/logger');
const { getAccounts, getRequestURL, getRefTypes} = require('../util/refedge');

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
        // Account selected
        let existingConn = await connFactory.getConnection(message.team.id, controller);
        if (existingConn && message.actions != null && message.actions[0].action_id == 'content_search') {
            console.log('28 : content_search');
            let requestURL = await getRequestURL(existingConn,message.actions[0].selected_option.value);
            await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
        } else if (existingConn && message.actions != null && message.actions[0].action_id == 'account_search') {
            console.log('32 : account_search');
            let requestURL = await getRequestURL(existingConn,message.actions[0].selected_option.value);
            await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
        } else if (existingConn && message.actions != null && message.actions[0].action_id == 'request') {
            console.log('request');
            const result = await bot.api.views.update({
                view_id:message.container.view_id,
                view: {
                    "type": "modal",
                    "private_metadata" : "test",
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
                        "text": "Request",
                        "emoji": true
                    },
                    "blocks": [
                        {
                            "type": "input",
                            "block_id" : "accblock",
                            "element": {
                                "type": "plain_text_input",
                                "action_id": "account_name",
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Active Reference Account"
                                },
                                "multiline": false
                            },
                            "label": {
                                "type": "plain_text",
                                "text": "Account Name",
                                "emoji": true
                            }
                        }
                    ]
                }
            });
        } else if (existingConn && message.actions != null && message.actions[0].action_id == 'accountSelect') {
            console.log('73 : accountSelect');
            let requestURL = await getRequestURL(existingConn,message.actions[0].selected_option.value);
            await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
        } else {
            console.log('77');
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
                                      "type": "multi_static_select",
                                      "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select items"
                                      },
                                      "options": accounts
                                    }
                                  }
                                ]};
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
                    for (let val of message.nlpResponse.queryResult.outputContexts) {
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
                let existingConn = await connFactory.getConnection(message.team, controller);
                console.log(message.user_id);
                console.log('----slash_command ***** message');
                console.dir(message);
                if (existingConn) {
                    const result = await bot.api.views.open({
                        trigger_id: message.trigger_id,
                        view: {
                            "type": "modal",
                            "private_metadata" : "test2",
                            "title": {
                                "type": "plain_text",
                                "text": "Select Action"
                            },
                            "blocks": [
                                {
                                    "type": "actions",
                                    "elements": [
                                        {
                                            "type": "button",
                                            "action_id" : "request",
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Create Request",
                                                "emoji": true
                                            },
                                            "value": "request"
                                        }
                                    ]
                                },
                                {
                                    "type": "actions",
                                    "elements": [
                                        {
                                            "type": "button",
                                            "action_id" : "account_search",
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Account Search",
                                                "emoji": true
                                            },
                                            "value": "account_search"
                                        }
                                    ]
                                },
                                {
                                    "type": "actions",
                                    "elements": [
                                        {
                                            "type": "button",
                                            "action_id" : "content_search",
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Content Search",
                                                "emoji": true
                                            },
                                            "value": "content_search"
                                        }
                                    ]
                                }
                            ]
                        }
                    });
                    
                } else if (!existingConn) {
                    const authUrl = connFactory.getAuthUrl(message.team);
                    await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                } 
            } catch (err) {
                logger.log(err);
            }
        }
    );
    controller.on(
        'view_submission',
        async (bot, message) => {

            try {
                
                /*if (!existingConn) {
                    const authUrl = connFactory.getAuthUrl(message.team);
                    await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                } else {*/
                    console.log('-----------view_submission message -----------');
                    console.dir(message);
                    let accName = "";
                    for (let key in message.view.state.values) {
                        if (message.view.state.values[key] != undefined && message.view.state.values[key].account_name != undefined && message.view.state.values[key].account_name != "") {
                            accName = message.view.state.values[key].account_name.value;
                            break;
                        }
                    }
                    console.log('accName = ' + accName);
                    if (accName == "") {
                        return Promise.resolve({
                            response_action: "errors",
                            errors: { "restaurant-name": "Please enter an Account Name." }
                        });
                    } else {
                        let existingConn = await connFactory.getConnection(message.team.id, controller);
                        const userProfile = await bot.api.users.info({
                            token : bot.api.token,
                            user : message.user
                        });
                        let accounts = await getAccounts(existingConn,accName,userProfile);
                        
                        let refTypes = await getRefTypes(existingConn,userProfile);
                        console.log('refTypes');
                        console.dir(refTypes);
                        let opps = [];
                        console.log('accounts');
                        console.dir(accounts);
                        if (accounts == null || Object.keys(accounts).length == 0) {
                            const errorStr = "No Active Reference program member found by name:" + accName + ". Please check the spelling or Activate the Account." ;
                            return Promise.resolve({
                                response_action: "errors",
                                errors: { "restaurant-name": errorStr}
                            });
                        } else if (Object.keys(accounts).length > 1) {
                            const result = await bot.api.views.update({
                                view_id:message.view.id,
                                view: {
                                    "type": "modal",
                                    "private_metadata" : message.view.private_metadata,
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
                                        "text": "Request",
                                        "emoji": true
                                    },
                                    "blocks": [
                                        {
                                            "type": "section",
                                            "block_id": "blkaccount",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "Please select an account from the dropdown list"
                                            },
                                            "accessory": {
                                                "action_id": "accountSelect",
                                                "type": "static_select",
                                                "placeholder": {
                                                "type": "plain_text",
                                                "text": "Select an account"
                                                },
                                                "options": accounts
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "block_id": "blkaccount",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "Please select a reftype from the dropdown list"
                                            },
                                            "accessory": {
                                                "action_id": "reftypeSelect",
                                                "type": "static_select",
                                                "placeholder": {
                                                "type": "plain_text",
                                                "text": "Select a type"
                                                },
                                                "options": refTypes
                                            }
                                        }
                                    ]
                                }
                            });
                            console.dir(result);
                        } else {
                            console.log('392');
                        }
                    }
                
            } catch (err) {
                console.log('396');
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