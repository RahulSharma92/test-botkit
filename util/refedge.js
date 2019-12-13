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
        console.log('accName :: ' + accName);
        if (accName == '' || accName == null) {
            return 'false';
        } else {
            conn.apex.get('/rebot/' + accName , accName, (err, res) => {

                if (err) {
                    logger.log(err);
                }
                if (res) {
                    console.dir(res);
                    if (res == 'false') {
                        return null;
                    }
                    logger.log(res);
                }
                return res;
            });
        }
    }

};