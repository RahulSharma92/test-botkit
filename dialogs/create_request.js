const { BotkitConversation } = require('botkit');
const connFactory = require('../util/connection-factory');

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