module.exports = controller => {

    controller.webserver.get('/login', (req, res) => {
        res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get('/oauth', async (req, res) => {

        try {
            console.log('-----/oauth/req-----')
            console.dir(controller.adapter);

            const authData = await controller.adapter.validateOauthCode(req.query.code);
            console.log('-----/authData/-----')
            console.dir(req.query)
            controller.trigger('oauth_success', authData);
            res.redirect(`https://slack.com/app_redirect?app=${process.env.SLACK_APP_ID}`);
        } catch (err) {
            console.error('OAUTH ERROR: ', err);
            res.status(401);
            res.send(err.message);
        }
    });
}