const logger = require('../../util/logger');

const checkTeamMigration = async (teamId, controller) => {

    try {
        const team = await controller.plugins.database.teams.get(teamId);
        console.log('------------in filter middleware team---------- ');
        console.dir(team);
        if (!team) {
            return false;
        }

        if (team.is_migrating) {
            return true;
        }
        return false;
    } catch (err) {
        logger.log(err);
    }
}

module.exports.checkTeamMigration = checkTeamMigration;
module.exports.getFilterMiddleware = controller => {
    return async (bot, message, next) => {

        if (message.event && message.event.type == 'app_uninstalled') {
            next();
        }

        try {
            console.log('------------in filter middleware---------- ', message.team_id);
            const isTeamMigrating = await checkTeamMigration(message.team_id, controller);

            if (!isTeamMigrating) {
                next();
            }
        } catch (err) {
            logger.log(err);
        }
    }
}