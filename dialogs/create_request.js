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
    convo.addQuestion('Okay, Do you like singing', [{
        pattern: 'no',
        handler: async(response, convo, bot) => {
            // if user says no, go back to favorite color.
            await convo.gotoThread('finalno');
        }
    },
    {
        default: true,
        handler: async(response, convo, bot) => {
            console.dir(convo);
            await convo.gotoThread('finalyes');
        }
    }],'song', 'singing');
    
    convo.addMessage('Bood bye  {{vars.name}}! It was nice knowing that ur fav color is {{vars.color}} and that you like singing', 'finalyes');
    convo.addMessage('Bood bye  {{vars.name}}! It was nice knowing that ur fav color is {{vars.color}} and that you do not like singing', 'finalno');

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
                console.dir(convo);
                await convo.gotoThread('singing');
            }
        }
    ], 'confirm', 'confirmation');
    
    controller.addDialog(convo);
}