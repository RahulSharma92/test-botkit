const logger = require('../util/logger');

module.exports = {
    saveTeamId: async (conn, teamData) => {
        await conn.apex.post('/rebot/saveTeamId', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    submitRequest: async (conn, teamData) => {
        let returnVal = '';
        try {
            await conn.apex.post('/rebot/submitRequest', teamData, (err, res) => {
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
        let url = action == null || action == '' ? '/rebot/REF_TYPE' + '::' + userProfile.user.profile.email : '/rebot/REF_TYPE::' + userProfile.user.profile.email + '::' + action;
        await conn.apex.get(url, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    response = JSON.parse(response);
                    let oppList = response['opp'];
                    let refList = response['ref'];
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
                                    "text": refList[k]
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