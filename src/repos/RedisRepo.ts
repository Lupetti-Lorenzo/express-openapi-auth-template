import { RedisClientOptions, createClient } from 'redis';
import EnvVars from '@src/constants/EnvVars';

// Initialize the Redis client
const { Host, Port } = EnvVars.Redis;
const url = `redis://${Host}:${Port}`;
const options: RedisClientOptions = { url };
const client = createClient(options).on('error', (err) => console.log('Redis Client Error', err));

console.log(`<<<< Connected to Redis >>>>`);

// Set a token in Redis by ID with an expiration time (in milliseconds)
export async function setTokenById(id: string, token: string, expirationInMilliseconds: number): Promise<string | null> {
	await client.connect();
	return client.set(id, token, {
		PX: expirationInMilliseconds,
	});
}

// Get a token from Redis by ID
export async function getTokenById(id: string): Promise<string | null> {
	await client.connect();
	return client.get(id);
}

// Revoke (delete) a token from Redis by ID
export async function revokeTokenById(id: string): Promise<number> {
	await client.connect();
	return client.del(id);
}

export default {
	setTokenById,
	getTokenById,
	revokeTokenById,
} as const;
