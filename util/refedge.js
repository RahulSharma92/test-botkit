const logger = require('../util/logger');
module.exports.getAccounts = getAccounts;
module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/rebot', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    }
};
async function getAccounts(conn, accName) {
    console.log('accName :: ' + accName);
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
                    return null;
                } else {
                    res = JSON.parse(res);
                    Object.keys(res).forEach(function(k){
                        console.log(k + ' - ' + res[k]);
                        var entry = {
                            "text": {
                                "type": "plain_text",
                                "text": res[k]
                            },
                            "value": k
                        }
                        val.push(entry);
                    });
                    console.log('---------******');
                    console.log(val);
                    return val;
                }
            }
            return val;
        });
    }
}