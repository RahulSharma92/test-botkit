const connFactory = require('../util/connection-factory');
const logger = require('../util/logger');
const { getAccounts, getRequestURL, getRefTypes,submitRequest} = require('../util/refedge');

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
    controller.hears('interactive', 'direct_message', function(bot, message) {
        console.log('19');
        bot.reply(message, {
            attachments:[
                {
                    title: 'Do you want to interact with my buttons?',
                    callback_id: '123',
                    attachment_type: 'default',
                    actions: [
                        {
                            "name":"yes",
                            "text": "Yes",
                            "value": "yes",
                            "type": "button",
                        },
                        {
                            "name":"no",
                            "text": "No",
                            "value": "no",
                            "type": "button",
                        }
                    ]
                }
            ]
        });
    });
    
    controller.on('block_actions',async function(bot, message) {
        console.log('block_actions');
        console.dir(message);
        try {
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
                const result = await bot.api.views.push({
                    trigger_id: message.trigger_id,
                    view: {
                        "type": "modal",
                        "notify_on_close" : true,
                        "callback_id" : "accountNameView",
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
                console.dir(result);
            } else if (existingConn && message.actions != null && message.actions[0].action_id == 'accountSelect') {
                console.log('73 : accountSelect');
                let requestURL = await getRequestURL(existingConn,message.actions[0].selected_option.value);
                await bot.reply(message, `click this link to create the request\n<${requestURL}|Create Request>`);
            
            } else {
                console.log('77' + message.actions[0].action_id);
                const authUrl = connFactory.getAuthUrl(message.team);
                await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
            }
        } catch (err) {
            logger.log(err);
        }
    });

    controller.on(
        'direct_message',
        async (bot, message) => {
            console.log('direct_message');
            console.dir(message);
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
                console.log('slash_command');
                console.dir(message);
                let existingConn = await connFactory.getConnection(message.team, controller);
                
                if (existingConn) {
                    const result = await bot.api.views.open({
                        trigger_id: message.trigger_id,
                        view: {
                            "type": "modal",
                            "notify_on_close" : true,
                            "callback_id" : "actionSelectionView",
                            "title": {
                                "type": "plain_text",
                                "text": "Reference Edge",
                                "emoji": true
                            },
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
                            
                            "blocks": [
                                {
                                    "type": "input",
                                    "block_id": "accblock",
                                    "element": {
                                        "type": "radio_buttons",
                                        "action_id": "searchid",
                                        "options": [
                                            {
                                                "value": "account_search",
                                                "text": {
                                                    "type": "plain_text",
                                                    "text": "Reference Account(s)"
                                                }
                                            },
                                            {
                                                "value": "content_search",
                                                "text": {
                                                    "type": "plain_text",
                                                    "text": "Reference Content(s)"
                                                }
                                            },
                                            {
                                                "value": "both",
                                                "text": {
                                                    "type": "plain_text",
                                                    "text": "Both"
                                                }
                                            }
                                        ]
                                    },
                                    "label": {
                                        "type": "plain_text",
                                        "text": "What do you need?",
                                        "emoji": true
                                    }
                                }
                            ]
                        }
                        
                    });
                    console.log('open view');
                    console.dir(result);
                    
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
        'view_closed',
        async (bot, message) => {
            console.log('-----------view_closed message -----------');
            console.dir(message);
    });

    controller.on(
        'view_submission',
        async (bot, message) => {
            console.log('view_submission');
            console.dir(message);

            try {
                let existingConn = await connFactory.getConnection(message.team.id, controller);
                        
                if (!existingConn) {
                    const authUrl = connFactory.getAuthUrl(message.team);
                    await bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                } else {
                    
                    // When Account Name entered
                    if (message.view.callback_id == 'accountNameView') {
                        let accName = "";
                        for (let key in message.view.state.values) {
                            if (message.view.state.values[key] != undefined && message.view.state.values[key].account_name != undefined && message.view.state.values[key].account_name != "") {
                                accName = message.view.state.values[key].account_name.value;
                                break;
                            }
                        }
                        console.log('accName = ' + accName);
                        if (accName == "") {
                            
                            bot.httpBody({
                                response_action: 'errors',
                                errors: {
                                  "accblock": 'Please enter an Account Name.'
                                }
                              });
                        } else {
                            let accounts = await getAccounts(existingConn,accName);
                            console.log('----------------accounts----------------')
                            console.dir(accounts);
                            if (accounts == null || Object.keys(accounts).length == 0) {
                                console.log('errors');
                                const errorStr = "*No Active Reference program member found by name:" + accName + ".\n Please check the spelling or Activate the Account.*" ;
                                bot.httpBody({
                                    response_action: 'errors',
                                    errors: {
                                      "accblock": errorStr
                                    }
                                  })
                            } else if (Object.keys(accounts).length > 0) {
                                const userProfile = await bot.api.users.info({
                                    token : bot.api.token,
                                    user : message.user
                                });
                                let mapval = await getRefTypes(existingConn,userProfile,null);
                                let refTypes = mapval.ref;
                                console.dir(mapval.opp);
                                let opps = mapval.opp;
                                if (opps != null && opps.length > 0) {
                                    bot.httpBody({
                                        response_action: 'update',
                                        view: {
                                            "type": "modal",
                                            "notify_on_close" : true,
                                            "callback_id": "detailView",
                                            "submit": {
                                                "type": "plain_text",
                                                "text": "Submit",
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
                                                    "block_id": "blkaccount",
                                                    "element": {
                                                        "type": "static_select",
                                                        "action_id": "account_select",
                                                        "placeholder": {
                                                            "type": "plain_text",
                                                            "text": "Select an item",
                                                            "emoji": true
                                                        },
                                                        "options": accounts
                                                    },
                                                    "label": {
                                                        "type": "plain_text",
                                                        "text": "Account",
                                                        "emoji": true
                                                    }
                                                },
                                                {
                                                    "type": "input",
                                                    "block_id": "blkref",
                                                    "element": {
                                                        "type": "static_select",
                                                        "action_id": "reftype_select",
                                                        "placeholder": {
                                                            "type": "plain_text",
                                                            "text": "Select a type",
                                                            "emoji": true
                                                        },
                                                        "options": refTypes
                                                    },
                                                    "label": {
                                                        "type": "plain_text",
                                                        "text": "Referenceability Type",
                                                        "emoji": true
                                                    }
                                                },
                                                {
                                                    "type": "input",
                                                    "optional": true,
                                                    "block_id": "blkopp",
                                                    "element": {
                                                        "type": "static_select",
                                                        "action_id": "opp_select",
                                                        "placeholder": {
                                                            "type": "plain_text",
                                                            "text": "Select an Opp",
                                                            "emoji": true
                                                        },
                                                        "options": opps
                                                    },
                                                    "label": {
                                                        "type": "plain_text",
                                                        "text": "Opportunity",
                                                        "emoji": true
                                                    }
                                                }
                                            ]
                                        }
                                    });
                                } else {
                                    bot.httpBody({
                                        response_action: 'update',
                                        view: {
                                            "type": "modal",
                                            "notify_on_close" : true,
                                            "callback_id": "detailView",
                                            "submit": {
                                                "type": "plain_text",
                                                "text": "Submit",
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
                                                    "block_id": "blkaccount",
                                                    "element": {
                                                        "type": "static_select",
                                                        "action_id": "account_select",
                                                        "placeholder": {
                                                            "type": "plain_text",
                                                            "text": "Select an item",
                                                            "emoji": true
                                                        },
                                                        "options": accounts
                                                    },
                                                    "label": {
                                                        "type": "plain_text",
                                                        "text": "Account",
                                                        "emoji": true
                                                    }
                                                },
                                                {
                                                    "type": "input",
                                                    "block_id": "blkref",
                                                    "element": {
                                                        "type": "static_select",
                                                        "action_id": "reftype_select",
                                                        "placeholder": {
                                                            "type": "plain_text",
                                                            "text": "Select a type",
                                                            "emoji": true
                                                        },
                                                        "options": refTypes
                                                    },
                                                    "label": {
                                                        "type": "plain_text",
                                                        "text": "Referenceability Type",
                                                        "emoji": true
                                                    }
                                                }
                                            ]
                                        }
                                    });
                                }
                            }
                        }
                    } else if (message.view.callback_id == 'detailView') {
                        console.log('detailView');
                        const refselected = message.view.state.values.blkref.reftype_select.selected_option;
                        const accselected = message.view.state.values.blkaccount.account_select.selected_option;
                        let oppSelected = {};
                        if (message.view.state.values.blkopp != null && message.view.state.values.blkopp.opp_select != null && message.view.state.values.blkopp.opp_select.selected_option != null) {
                            oppSelected = message.view.state.values.blkopp.opp_select.selected_option;
                        }
                        let days = 7;
                        console.dir(refselected);
                        console.dir(accselected);
                        if (refselected.value.indexOf('@@') > -1) {
                            days = refselected.value.split('@@')[0];
                        }
                        var newDate = new Date();
                        newDate.setDate(newDate.getDate() + parseInt(days));
                        let dateString = newDate.getFullYear() + "-" + parseInt(newDate.getMonth() + 1) + "-" + newDate.getDate();
                        console.log('dateString : ' + dateString);
                        let refselectemeta = {'ref' : refselected.value,'acc' : accselected.value,'opp' : oppSelected.value};
                        console.dir(refselectemeta);
                        if (oppSelected.value != null) {
                            bot.httpBody({
                                response_action: 'update',
                                view: {
                                    "type": "modal",
                                    "notify_on_close" : true,
                                    "callback_id" : "select_deadline",
                                    "private_metadata" : JSON.stringify(refselectemeta),
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
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*Account* : " + accselected.text.text
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*Referenceability Type* : " + refselected.text.text
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*Opportunity* : " + oppSelected.text.text
                                            }
                                        },
                                        {
                                            "type": "input",
                                            "block_id": "blkdeadline",
                                            "element": {
                                                "type": "datepicker",
                                                "initial_date": dateString,
                                                "action_id": "selectdeadline",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select deadline",
                                                    "emoji": true
                                                }
                                            },
                                            "label": {
                                                "type": "plain_text",
                                                "text": "Deadline",
                                                "emoji": true
                                            }
                                        }
                                    ]
                                }
                            });
                        } else {
                            bot.httpBody({
                                response_action: 'update',
                                view: {
                                    "type": "modal",
                                    "notify_on_close" : true,
                                    "callback_id" : "select_deadline",
                                    "private_metadata" : JSON.stringify(refselectemeta),
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
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*Account* : " + accselected.text.text
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*Referenceability Type* : " + refselected.text.text
                                            }
                                        },{
                                            "type": "input",
                                            "block_id": "blkdeadline",
                                            "element": {
                                                "type": "datepicker",
                                                "initial_date": dateString,
                                                "action_id": "selectdeadline",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select deadline",
                                                    "emoji": true
                                                }
                                            },
                                            "label": {
                                                "type": "plain_text",
                                                "text": "Deadline",
                                                "emoji": true
                                            }
                                        }
                                    ]
                                }
                            });
                        }
                    } else if (message.view.callback_id == 'select_deadline') {
                        const dateselected = message.view.state.values.blkdeadline.selectdeadline.selected_date;
                        let dataMap = JSON.parse(message.view.private_metadata);
                        let refselected = dataMap.ref;
                        
                        if (refselected.indexOf('@@') > -1) {
                            let days = refselected.split('@@')[0];
                            var todayDate = new Date();
                            todayDate.setDate(todayDate.getDate() + (parseInt(days) - 1 ));
                            let dateConverted = new Date(dateselected);
                            dataMap.ref = refselected.split('@@')[1];
                            if (dateConverted < todayDate ) {
                                const dateString = todayDate.getDate() + 1 + "-" + parseInt(todayDate.getMonth() + 1) + "-" + todayDate.getFullYear();
                                bot.httpBody({
                                    response_action: 'errors',
                                    errors: {
                                      "blkdeadline": 'Selected Date must be greater than "' + dateString + '".'
                                    }
                                  });
                            } else {
                                dataMap['deadline'] = dateselected;
                                console.log(dataMap);
                                let responseString = 'Request Successfully created. Thank You:thumbsup:';
                                let res = await submitRequest(existingConn,dataMap);
                                console.log(res);
                                if (res.indexOf('referenceuserequest') > -1) {
                                    responseString = 'Please click the link to complete the request <' + res + '|Complete Request>';
                                }
                                bot.httpBody({
                                    response_action: 'update',
                                    view: {
                                        "type": "modal",
                                        "notify_on_close" : true,
                                        "close": {
                                            "type": "plain_text",
                                            "text": "Close",
                                            "emoji": true
                                        },
                                        "title": {
                                            "type": "plain_text",
                                            "text": "Request Created",
                                            "emoji": true
                                        },
                                        "blocks": [
                                            {
                                                "type": "section",
                                                "text": {
                                                    "type": "mrkdwn",
                                                    "text": responseString
                                                }
                                            }
                                        ]
                                    }
                                });
                            }
                        }
                    } else if (message.view.callback_id == 'actionSelectionView') {
                        let actionName = 'account_search';
                        for (let key in message.view.state.values) {
                            if (message.view.state.values[key] != undefined && message.view.state.values[key].searchid != undefined && message.view.state.values[key].searchid != "") {
                                actionName = message.view.state.values[key].searchid.selected_option.value;
                                break;
                            }
                        }
                        const userProfile = await bot.api.users.info({
                            token : bot.api.token,
                            user : message.user
                        });
                        console.log(actionName);
                        let mapval = await getRefTypes(existingConn,userProfile,actionName);
                        let selectionLabel = 'Referenceability Type';
                        console.dir(mapval);

                        if (actionName == 'content_search') {
                            selectionLabel = 'Content Type';
                        }
                        let refTypes = mapval.ref;
                        let searchURL = mapval.searchURL;
                        let opps = mapval.opp;

                        if (opps != null && opps.length > 0) {
                            bot.httpBody({
                                response_action: 'update',
                                view: {
                                    "type": "modal",
                                    "notify_on_close" : true,
                                    "callback_id": "searchselect",
                                    "private_metadata" : searchURL,
                                    "submit": {
                                        "type": "plain_text",
                                        "text": "Submit",
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
                                            "block_id": "blkref",
                                            "element": {
                                                "type": "static_select",
                                                "action_id": "reftype_select",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select a type",
                                                    "emoji": true
                                                },
                                                "options": refTypes
                                            },
                                            "label": {
                                                "type": "plain_text",
                                                "text": selectionLabel,
                                                "emoji": true
                                            }
                                        },
                                        {
                                            "type": "input",
                                            "block_id": "blkopp",
                                            "element": {
                                                "type": "static_select",
                                                "action_id": "opp_select",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select an Opp",
                                                    "emoji": true
                                                },
                                                "options": opps
                                            },
                                            "label": {
                                                "type": "plain_text",
                                                "text": "Opportunity",
                                                "emoji": true
                                            }
                                        }
                                    ]
                                }
                            });
                        } else {
                            bot.httpBody({
                                response_action: 'update',
                                view: {
                                    "type": "modal",
                                    "notify_on_close" : true,
                                    "callback_id": "searchselect",
                                    "private_metadata" : searchURL,
                                    "submit": {
                                        "type": "plain_text",
                                        "text": "Submit",
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
                                            "block_id": "blkref",
                                            "element": {
                                                "type": "static_select",
                                                "action_id": "reftype_select",
                                                "placeholder": {
                                                    "type": "plain_text",
                                                    "text": "Select a type",
                                                    "emoji": true
                                                },
                                                "options": refTypes
                                            },
                                            "label": {
                                                "type": "plain_text",
                                                "text": selectionLabel,
                                                "emoji": true
                                            }
                                        }
                                    ]
                                }
                            });
                        }
                    } else if (message.view.callback_id == 'searchselect') {
                        console.log('searchURL ***** ' + message.view.private_metadata);
                        const refselected = message.view.state.values.blkref.reftype_select.selected_option;
                        let oppSelected = message.view.state.values.blkopp != null ? message.view.state.values.blkopp.opp_select.selected_option.value : '';
                        let searchURL = message.view.private_metadata.replace('@@',oppSelected);
                        searchURL += oppSelected == null || oppSelected == '' ? '?type=' : '&type=';
                        searchURL += refselected.value.indexOf('::') > -1 ? refselected.value.split('::')[1] : refselected.value;
                        searchURL = 'Please click the link to continue <' + searchURL + '|Complete Request>';
                        bot.httpBody({
                            response_action: 'update',
                            view: {
                                "type": "modal",
                                "notify_on_close" : true,
                                "close": {
                                    "type": "plain_text",
                                    "text": "Close",
                                    "emoji": true
                                },
                                "title": {
                                    "type": "plain_text",
                                    "text": "Continue Search",
                                    "emoji": true
                                },
                                "blocks": [
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "mrkdwn",
                                            "text": searchURL
                                        }
                                    }
                                ]
                            }
                        });
                    }
                }
            } catch (err) {
                console.log('396');
                logger.log(err);
            }
        }
    );
    controller.on('error', console.error);

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