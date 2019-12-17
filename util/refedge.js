const logger = require('../util/logger');

module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/rebot', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    getAccounts: async (conn, accName) => {
        console.log('1 initial accName :: ' + accName);
        if (accName == '' || accName == null) {
            return 'false';
        } else {
            var val = [];
            await conn.apex.get('/rebot/' + accName , accName, (err, response) => {
                if (err) {
                    logger.log(err);
                } else  if (response) {
                    if (response == 'false') {
                        console.log('2 null');
                        return null;
                    } else {
                        Object.keys(response).forEach(function(k){
                            var entry = {
                                "text": {
                                    "type": "plain_text",
                                    "text": response[k]
                                },
                                "value": k
                            }
                            val.push(entry);
                        });
                        console.log('2 ---------******');
                        console.log(val);
                    }
                }
            });
            console.log('3 ---------******');
            return val;
        }
    }

};