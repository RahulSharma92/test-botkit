const logger = require('../util/logger');

module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/rebot', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    getAccounts: (conn, accName) => {
        conn.apex.get('/rebot', accName, (err, res) => {

            if (err) {
                logger.log(err);
            }
            if (res) {
                logger.log(res);
            }
        });
    }

};