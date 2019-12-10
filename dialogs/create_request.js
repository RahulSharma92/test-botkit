const { BotkitConversation } = require('botkit');
const connFactory = require('../util/connection-factory');

module.exports = controller => {
    let convo = new BotkitConversation('create_request', controller);
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
                console.log(response);
                bot.say('url' + existingConn.instanceUrl);
            }
        }
    ], 'reconnect', 'default');

    controller.addDialog(convo);
}