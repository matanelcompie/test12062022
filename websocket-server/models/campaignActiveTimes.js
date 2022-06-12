const Sequelize = require('sequelize');

var createModel = function(sequelize) {
	return sequelize.define('campaign_active_times',
		{
			key: Sequelize.STRING,
		 	campaign_id: Sequelize.INTEGER,
		  	end_date: Sequelize.DATE
		},
		{
			underscored: true,
		}
	);
};

module.exports = createModel;