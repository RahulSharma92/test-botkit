const connFactory = require('../util/connection-factory');
const { saveTeamId } = require('../util/refedge');
const logger = require('../util/logger');

module.exports = controller => {

    controller.webserver.get('/sfauth/callback', async (req, res) => {
        console.log('sfauth : req 8');
        try {

            if (req.query.error) {
                logger.log('salesforce auth error:', req.query.error);
                res.status(401);
                res.json({ ok: true, msg: 'salesforce auth failed' });
                //res.sendFile('/auth-failed.html');
            }
            console.log('sfauth :17');
            if (req.query.code && req.query.state) {
                let conn = await connFactory.connect(req.query.code, controller, req.query.state);
                console.log('sfauth :20');
                let teamData = { addTeam: req.query.state };
                console.log('sfauth :22');
                await saveTeamId(conn, teamData);
                res.status(302);
                console.log('sfauth :25');
                res.json({ ok: true, msg: 'salesforce auth successful' });
                console.log('sfauth :27');
                //res.redirect('/auth-success.html');
            }
        } catch (err) {
            logger.log('salesforce auth error:', err);
        }
    });
}