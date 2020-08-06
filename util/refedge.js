const logger = require('../util/logger');

module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/rebot', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    getRefTypes: async (conn,userProfile) => {
        let val = [];
        console.log('userProfile');
        console.dir(userProfile);
        await conn.apex.get('/rebot/REF_TYPE', userProfile.user.profile.email , (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    response = JSON.parse(response);
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
                }
            }
        });
        return val;
    },
    
    getAccounts: async (conn, accName) => {
        if (accName == '' || accName == null) {
            return 'false';
        } else {
            let val = [];
            await conn.apex.get('/rebot/' + accName , accName, (err, response) => {
                if (err) {
                    logger.log(err);
                } else  if (response) {
                    if (response != 'false') {
                        response = JSON.parse(response);
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
                    }
                }
            });
            return val;
        }
    },
    getRequestURL: async (conn, accId) => {
        if (accId == '' || accId == null) {
            return 'false';
        } else {
            let val = '';
            await conn.apex.get('/rebot/' + 'LINK_URL' ,'LINK_URL', (err, response) => {
                if (err) {
                    logger.log(err);
                } else  if (response) {
                    logger.log(err);
                    if (response != 'false') {
                        val = response.replace('@@', accId);
                    }
                }
            });
            return val;
        }
    }
};