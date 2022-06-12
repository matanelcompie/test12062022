const Sequelize = require('sequelize');

var createModel = function(sequelize) {
	return sequelize.define('campaign_user_active_times',
		{
		 	campaign_id: Sequelize.INTEGER,
		  	user_id: Sequelize.INTEGER,
		  	end_date: Sequelize.DATE,
			total_seconds: Sequelize.INTEGER
		},
		{
			underscored: true,
		}
	);
};

module.exports = createModel;