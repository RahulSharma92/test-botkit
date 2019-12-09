const { BotkitConversation } = require('botkit');
const connFactory = require('../util/connection-factory');

module.exports = controller => {
    let convo = new BotkitConversation('create_request', controller);
    convo.say('Howdy!');

    convo.ask('What is your name?', async(response, convo, bot) => {
        console.log(`user name is ${ response }`);
    }, 'name');
    controller.addDialog(convo);
}