import { RedisClientOptions, createClient } from 'redis';
import EnvVars from '@src/constants/EnvVars';
import logger from 'jet-logger';
import PwdUtil from '@src/util/PwdUtil';

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
// storeo the hash of the token, not the token itself
async function setTokenById(id: string, token: string, expirationInMilliseconds: number): Promise<string | null> {
	const hash = await PwdUtil.getHash(token);
	return client.set(id, hash, {
		PX: expirationInMilliseconds,
	});
}

// Get a token from Redis by ID
async function getTokenById(id: string): Promise<string | null> {
	return client.get(id);
}

// Revoke (delete) a token from Redis by ID
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
