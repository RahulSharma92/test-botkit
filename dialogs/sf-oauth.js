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
                console.log('response----');
                console.log(response);
                var teamResponse = await bot.api.team.info();
                const authUrl = connFactory.getAuthUrl(teamResponse.team.id);
                convo.setVar('authUrl',authUrl);
                await convo.gotoThread('connect');
            }
        },
        {
            pattern: '^(no|nah|nope|n)',
            handler: async function(response, convo, bot) {
                console.log('response----');
                console.log(response);
                await convo.gotoThread('no_thread');
            }
        },
        {
            default: true,
            handler: async function(response, convo, bot) {
                console.log('response----');
                console.log(response);
                await convo.gotoThread('bad_response');
            }
        }
    ], 'reconnect', 'default');

    controller.addDialog(convo);
}


