import { RedisClientOptions, createClient } from 'redis';
import EnvVars from '@src/constants/EnvVars';
import logger from 'jet-logger';
// import { RouteError } from '@src/other/classes';
// import HttpStatusCodes from '@src/constants/HttpStatusCodes';

export const SERVER_ERROR = 'Internal error';

// Initialize the Redis client
const { Host, Port } = EnvVars.Redis;
const url = `redis://${Host}:${Port}`;
const options: RedisClientOptions = { url };
const client = createClient(options).on('error', () => {
	logger.err('REDIS DIED');
});
client.connect();

console.log(`<<<< Connected to Redis >>>>`);

// Set a token in Redis by ID with an expiration time (in milliseconds)
// async function setTokenById(id: string, token: string, expirationInMilliseconds: number): Promise<string | null> {
// 	try {
// 		const added = await return client.set(id, token, {
// 	  PX: expirationInMilliseconds,
//  });
// 		return added;
// 	} catch (error) {
// 		throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, SERVER_ERROR);
// 	}
// }
async function setTokenById(id: string, token: string, expirationInMilliseconds: number): Promise<string | null> {
	return client.set(id, token, {
		PX: expirationInMilliseconds,
	});
}

// Get a token from Redis by ID
// async function getTokenById(id: string): Promise<string | null> {
// 	try {
// 		const token = await client.get(id);
// 		return token;
// 	} catch (error) {
// 		throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, SERVER_ERROR);
// 	}
// }

async function getTokenById(id: string): Promise<string | null> {
	return client.get(id);
}

// Revoke (delete) a token from Redis by ID
// async function revokeTokenById(id: string): Promise<number> {
// 	try {
// 		const deleted = await client.del(id);
// 		return deleted;
// 	} catch (error) {
// 		throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, SERVER_ERROR);
// 	}
// }

async function revokeTokenById(id: string): Promise<number> {
	return client.del(id);
}

async function closeConnection() {
	await client.quit();
}

export default {
	setTokenById,
	getTokenById,
	revokeTokenById,
	closeConnection,
} as const;
