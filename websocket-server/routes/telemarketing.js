const controllers = require('../controllers/');
const TelemarketingActions = require('../actions/TelemarketingActions');

module.exports = (socket) => {
	console.log("Connected succesfully to the socket ...");
	socket.on('authentication', function(data) {
        controllers.AuthController.authenticate(socket, data);
    });
}