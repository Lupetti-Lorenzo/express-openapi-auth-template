import { RedisClientOptions, createClient } from 'redis';
import { promisify } from 'util';
import EnvVars from '@src/constants/EnvVars';

// Initialize the Redis client
const { Host, Port } = EnvVars.Redis;
const url = `redis://${Host}:${Port}`;
const options: RedisClientOptions = { url };
const client = createClient(options);

client.on('error', (err) => {
	console.log(`>>>> Redis Error: ${err}`);
});

console.log(`<<<< Connected to Redis >>>>`);

// Promisified Redis functions
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

// Set a token in Redis by ID with an expiration time (in milliseconds)
export async function setTokenById(id: string, token: string, expirationInMilliseconds: number): Promise<void> {
	await client.connect().catch((err) => console.log(err));
	await setAsync(id, token, 'PX', expirationInMilliseconds);
}

// Get a token from Redis by ID
export async function getTokenById(id: string): Promise<string | null> {
	return await getAsync(id);
}

// Revoke (delete) a token from Redis by ID
export async function revokeTokenById(id: string): Promise<void> {
	await delAsync(id);
}

export default {
	setTokenById,
	getTokenById,
	revokeTokenById,
} as const;
