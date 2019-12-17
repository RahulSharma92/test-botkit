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
            conn.apex.get('/rebot/' + accName , accName, (err, res) => {
                var val = [];
                if (err) {
                    logger.log(err);
                }
                if (res) {
                    if (res == 'false') {
                        console.log('2 null');
                        return null;
                    } else {
                        res = JSON.parse(res);
                        Object.keys(res).forEach(function(k){
                            var entry = {
                                "text": {
                                    "type": "plain_text",
                                    "text": res[k]
                                },
                                "value": k
                            }
                            val.push(entry);
                        });
                        console.log('2 ---------******');
                        console.log(val);
                        return val;
                    }
                }
                return val;
            });
        }
    }

};