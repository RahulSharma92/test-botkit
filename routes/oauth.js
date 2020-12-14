module.exports = controller => {

    controller.webserver.get('/login', (req, res) => {
        res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get('/oauth', async (req, res) => {

        try {
            console.log('-----/oauth/req-----')
            console.dir(controller.adapter);
            let botInstance = controller.spawn({});
            let options = {
                client_id: controller.adapter.options.clientId,
                client_secret: controller.adapter.options.clientSecret,
                code: req.query.code
            };
            botInstance.api.oauth.v2.access(options, (err, auth) => {
                console.log('!----- inside function ---------!');
                
                if (err) {
                    console.dir(err);
                    res.status(401);
                    return res.redirect('/auth-failed.html');
                }

                botInstance.api.auth.test({ token: auth.access_token }, (err, identity) => {

                    if (err) {
                        res.status(401);
                        return res.redirect('/auth-failed.html');
                    }
                    console.log('........success............');
                    auth.identity = identity;
                    controller.trigger('oauth_success', [auth]);
                    res.redirect(`https://slack.com/app_redirect?app=${process.env.SLACK_APP_ID}`);
                });
            });



            //const authData = await controller.adapter.validateOauthCode(req.query.code);
            /* console.log('-----/authData/-----')
            console.dir(req.query)
            controller.trigger('oauth_success', authData);
            res.redirect(`https://slack.com/app_redirect?app=${process.env.SLACK_APP_ID}`); */
        } catch (err) {
            console.error('OAUTH ERROR: ', err);
            res.status(401);
            res.send(err.message);
        }
    });
}