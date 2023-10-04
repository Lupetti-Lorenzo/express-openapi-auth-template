/* eslint-disable no-process-exit */
import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/constants/EnvVars';
import app from './server';
import { Socket } from 'net';
import RedisRepo from './repos/RedisRepo';

// **** Run **** //

const SERVER_START_MSG = 'Express server started on port: ' + EnvVars.Port.toString();

const server = app.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));

// **** SHUTDOWN HANDLER **** //
/* eslint-disable node/no-process-env */

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

// eslint-disable no-process-exit
let connections: Socket[] = [];

// every incoming request is going to trigger this handler
server.on('connection', (connection) => {
	// add new connection to the array
	connections.push(connection);
	// automatically remove connection from list when it's closed
	connection.on('close', () => (connections = connections.filter((curr) => curr !== connection)));
});

function shutDown() {
	logger.info('Received kill signal, shutting down gracefully');

	server.close(() => {
		logger.info('Closed out remaining connections');
		process.exit(0);
	});

	setTimeout(() => {
		logger.err('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);
	// close connections
	connections.forEach((curr) => curr.end());
	setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
	// close redris client
	RedisRepo.closeConnection();
}
