const Sequelize = require('sequelize');

var createModel = function(sequelize) {
	return sequelize.define('campaign_portion_progress',
		{
			portion_id: Sequelize.INTEGER,
		 	processing_count: Sequelize.INTEGER,
		  	processed_count: Sequelize.BOOLEAN,
		},
		{
			underscored: true,
			freezeTableName: true,
		}
	);
};

module.exports = createModel;