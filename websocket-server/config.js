const dotenv = require('dotenv').config({path: '../.env'});

function env(envVariable, defaultVariable) {
	return (envVariable != undefined)? envVariable : defaultVariable;
}
module.exports = {
	redis_host: env(process.env.REDIS_HOST,'localhost'),
	redis_password: env(process.env.REDIS_PASSWORD,null),
	redis_port: env(process.env.REDIS_PORT,6379),
	redis_db: env(process.env.REDIS_DATABASE,0),
	jwt_secret: env(process.env.JWT_SECRET,'my secret'),
	ssl_key: env(process.env.SSL_KEY,'./ssl/localhost.key'),
	ssl_cert: env(process.env.SSL_CERT,'./ssl/localhost.cert'),
	ca_cert: env(process.env.CA_CERT, null),
	server_port: env(process.env.WEBSOCKET_PORT,8000),
	db_host: env(process.env.DB_HOST,'localhost'),
	db_port: env(process.env.DB_PORT,3306),
	db_user: env(process.env.DB_USERNAME,'root'),
	db_password: env(process.env.DB_PASSWORD,''),
	db_name: env(process.env.DB_DATABASE,'test'),
}