const Sequelize = require('sequelize');

var createModel = function(sequelize) {
	return sequelize.define('finished_voters_in_campaign',
		{
			voter_id: Sequelize.INTEGER,
		 	campaign_id: Sequelize.INTEGER,
		  	status: Sequelize.BOOLEAN,
		},
		{
			underscored: true,
			freezeTableName: true,
		}
	);
};

module.exports = createModel;