const logger = require('../util/logger');

module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/rebot/saveTeamId', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    submitRequest: async (conn, teamData) => {
        let returnVal = '';
        try {
            await conn.apex.post('/rebot/submitRequest', teamData, (err, res) => {
                console.dir(res);
                returnVal = res;
                if (err) {
                    logger.log(err);
                } 
            });
        } catch (err) {
            console.log(err);
        }
            return returnVal;
    },
    getRefTypes: async (conn,userProfile,action) => {
        let opp = [];
        let ref = [];
        let returnVal = {};
        let url = action == null || action == '' ? '/rebot/REF_TYPE' : '/rebot/REF_TYPE::' + action;
        await conn.apex.get(url + '::' + userProfile.user.profile.email, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    console.log('------ ref Type Response-------');
                    response = JSON.parse(response);
                    console.dir(response);
                    let oppList = JSON.parse(response['opp']);
                    let refList = JSON.parse(response['ref']);
                    returnVal['searchURL'] = response['searchURL'];
                    oppList.forEach(function(oppWrapper){
                        let entry = {
                            "text": {
                                "type": "plain_text",
                                "text": oppWrapper['oppName'] + '(' + oppWrapper['accName'] + ')'
                            },
                            "value": oppWrapper['id']
                        }
                        opp.push(entry);
                    });
                    if (action == 'content_search') {
                        Object.keys(refList).forEach(function(k){
                            var entry = {
                                "text": {
                                    "type": "plain_text",
                                    "text": response[k]
                                },
                                "value": k
                            }
                            ref.push(entry);
                        });
                    } else {
                        Object.keys(refList).forEach(function(k){
                            let entry = {
                                "text": {
                                    "type": "plain_text",
                                    "text": k
                                },
                                "value": refList[k]
                            }
                            ref.push(entry);
                        });
                    }
                    returnVal['ref'] = ref;
                    returnVal['opp'] = opp;
                    console.dir(ref);
                }
            }
        });
        return returnVal;
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