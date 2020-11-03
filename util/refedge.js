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
    getRefTypes: async (conn,action) => {
        let ref = [];
        let url = action == null || action == '' ? '/rebot/REF_TYPE' : '/rebot/REF_TYPE::' + action;
        console.log('28' + url);
        await conn.apex.get(url, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    response = JSON.parse(response);
                    console.log(response)
                    if (action == 'content_search') {
                        Object.keys(response).forEach(function(k){
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
                        Object.keys(response).forEach(function(k){
                            let entry = {
                                "text": {
                                    "type": "plain_text",
                                    "text": k
                                },
                                "value": response[k]
                            }
                            ref.push(entry);
                        });
                    }
                }
            }
        });
        return ref;
    },
    getOpp: async (conn,email,action) => {
        let opp = [];
        let returnVal = {};
        let url = action == null || action == '' ? '/rebot/OPP_TYPE' + '::' + email : '/rebot/OPP_TYPE::' + email + '::' + action;
        await conn.apex.get(url, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    console.log(response);
                    response = JSON.parse(response);
                    console.dir(response);
                    let oppList = response['opp'];
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
                    returnVal['opp'] = opp;
                }
            }
        });
        return returnVal;
    },
    getOppfromName: async (conn,email,name) => {
        let opp = [];
        let url = '/rebot/OPP_TYPE_NAME' + '::' + email + '::' + name;
        console.log(url);
        await conn.apex.get(url, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    response = JSON.parse(response);;
                    response.forEach(function(oppWrapper){
                        let entry = {
                            "text": {
                                "type": "plain_text",
                                "text": oppWrapper['oppName'] + '(' + oppWrapper['accName'] + ')'
                            },
                            "value": oppWrapper['id']
                        }
                        opp.push(entry);
                    });
                }
            }
        });
        return opp;
    },
    getOppfromAcc: async (conn,email,name) => {
        let opp = [];
        let url = '/rebot/OPP_TYPE_ACCNAME' + '::' + email + '::' + name;
        console.log(url);
        await conn.apex.get(url, (err, response) => {
            if (err) {
                logger.log(err);
            } else  if (response) {
                if (response != 'false') {
                    response = JSON.parse(response);;
                    response.forEach(function(oppWrapper){
                        let entry = {
                            "text": {
                                "type": "plain_text",
                                "text": oppWrapper['oppName'] + '(' + oppWrapper['accName'] + ')'
                            },
                            "value": oppWrapper['id']
                        }
                        opp.push(entry);
                    });
                }
            }
        });
        return opp;
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