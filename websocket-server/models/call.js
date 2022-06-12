const Sequelize = require('sequelize');

var createModel = function(sequelize) {
	return sequelize.define('calls',
		{
			key: Sequelize.STRING,
		 	phone_number: Sequelize.STRING,
		  	call_end_status: Sequelize.BOOLEAN,
		  	call_end_date: Sequelize.DATE,
		  	call_action_end_date: Sequelize.DATE,
		  	deleted: Sequelize.BOOLEAN,
		},
		{
			underscored: true,
		}
	);
};

module.exports = createModel;