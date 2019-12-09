const { BotkitConversation } = require('botkit');
const connFactory = require('../util/connection-factory');

module.exports = controller => {
    let convo = new BotkitConversation('sf_auth', controller);

    convo.addMessage({
        text: `Ok, You are still connected to your old Salesforce instance.`,
        action: 'complete'
    }, 'no_thread');

    convo.addMessage({
        text: `Sorry, I didn't understand that. Please provide a yes or no response.`,
        action: 'default'
    }, 'bad_response');

    convo.addMessage({
        text: `click this link to connect\n<{{vars.authUrl}}|Connect to Salesforce>`,
        action: 'default'
    }, 'connect');

    convo.addQuestion('You are already connected to a Salesforce instance. Are you sure you want to disconnect from it and connect to another instance?', [
        {
            pattern: '^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah)',
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                var teamResponse = await bot.api.team.info();
                const authUrl = connFactory.getAuthUrl(teamResponse.team.id);
                convo.setVar('authUrl',authUrl);
                console.log('----Convo.vars:', convo.vars.authUrl);
                await convo.gotoThread('connect');
            }
        },
        {
            pattern: '^(no|nah|nope|n)',
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                await convo.gotoThread('no_thread');
            }
        },
        {
            default: true,
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                await convo.gotoThread('bad_response');
            }
        }
    ], 'reconnect', 'default');

    controller.addDialog(convo);
}


module.exports = controller => {
    let convo = new BotkitConversation('create_request', controller);
    convo.say('Howdy!');

    convo.ask('What is your name?', async(response, convo, bot) => {
        console.log(`user name is ${ response }`);
    }, 'name');

    convo.addAction('favorite_color');

    convo.addMessage('Awesome {{vars.name}}!', 'favorite_color');
    convo.addQuestion('Now, what is your favorite color?', async(response, convo, bot) => {
        console.log(`user favorite color is ${ response }`);
    },'color', 'favorite_color');

    convo.addAction('confirmation' ,'favorite_color');

    // do a simple conditional branch looking for user to say "no"
    convo.addQuestion('Your name is {{vars.name}} and your favorite color is {{vars.color}}. Is that right?', [
        {
            pattern: 'no',
            handler: async(response, convo, bot) => {
                // if user says no, go back to favorite color.
                await convo.gotoThread('favorite_color');
            }
        },
        {
            default: true,
            handler: async(response, convo, bot) => {
                convo.addQuestion('Now, Do you like Singing?', async(response, convo, bot) => {
                    console.log(`user Singing ${ response }`);
                },'singing', 'default');
            }
        }
    ], 'confirm', 'confirmation');
    convo.addQuestion('Please Enter the Account Name u want to create request for', [
        {
            default: true,
            handler: async function(response, convo, bot) {
                let existingConn = await connFactory.getConnection(message.team, controller);
                if (existingConn) {
                    console.log('instance url----' + existingConn.instanceUrl);
                }
                console.log('nlp response----');
                console.log(response);
                console.dir(existingConn);
                bot.say('url' + existingConn.instanceUrl);
            }
        }
    ], 'reconnect', 'default');

    controller.addDialog(convo);
}

