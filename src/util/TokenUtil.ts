import { Request, Response } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { RouteError } from '@src/other/classes';
import jsonwebtoken from 'jsonwebtoken';
import { TOKEN_MALFORMED } from '@src/constants/ErrorMessages';
import logger from 'jet-logger';

import RedisRepo from '@src/repos/RedisRepo';

import EnvVars from '../constants/EnvVars';
import { ISessionUser, TSessionData } from '@src/models/User';

// **** Variables **** //

// Errors
const Errors = {
	ParamFalsey: 'Param is falsey',
	Validation: 'JSON-web-token validation failed.',
} as const;

// Options
const AccessTokenOptions = {
	expiresIn: EnvVars.Jwt.Exp,
};

const RefreshTokenOptions = {
	expiresIn: String(EnvVars.CookieProps.Options.maxAge),
};

// **** Functions **** //

// **** Refresh Token **** //
/**
 * Add a JWT refresh token to cookies and database
 */
async function addRefreshToken(res: Response, data: ISessionUser): Promise<Response> {
	if (!res || !data || typeof data !== 'object') {
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
	}
	// Setup JWT
	const jwt = await _sign(data, EnvVars.Jwt.RefreshSecret, RefreshTokenOptions),
		{ Key, Options } = EnvVars.CookieProps;
	// set refresh token inside database
	await RedisRepo.setTokenById(String(data.id), jwt, Number(RefreshTokenOptions.expiresIn));
	// Return the res with the cookie set
	return res.cookie(Key, jwt, Options);
}

// returns the refresh token data that can be string or object from the request but is a promise that can be rejected
function decodeCookiesSession<T>(req: Request): Promise<string | T | undefined> {
	const { Key } = EnvVars.CookieProps,
		jwt = req.signedCookies[Key];
	return _decode<T>(jwt, EnvVars.Jwt.RefreshSecret);
}

// here i implement the error handling for the cookies decoding for the object and return the session data
// here i implement the error handling for the cookies decoding for the object and return the session data
async function getRefreshTokenSession(req: Request, res: Response): Promise<ISessionUser | undefined> {
	// get access token data from header
	const accessTokenData = await getDecodedToken<TSessionData>(req, res, decodeCookiesSession);
	// check if is the correct type
	if (!accessTokenData || typeof accessTokenData !== 'object') return undefined;
	// return the session
	return extractUserInfo(accessTokenData);
}

// returns the refresh token from the request
function getRefreshToken(req: Request): string | undefined {
	const { Key } = EnvVars.CookieProps,
		jwt = req.signedCookies[Key];
	return jwt;
}

// check if the refresh token exists in the redis database
async function refreshTokenExists(id: number): Promise<boolean> {
	const token = await RedisRepo.getTokenById(String(id));
	return token !== null;
}

// invalidate the refresh token in the redis database
async function invalidateRefreshToken(req: Request, res: Response): Promise<boolean> {
	const sessionData = await getRefreshTokenSession(req, res);
	if (!sessionData) return false;
	// extract id from the token
	const id = String(sessionData.id);
	// invalidate refresh token
	await RedisRepo.revokeTokenById(id);
	// return success
	return true;
}

// clear the cookie from the response
function clearCookie(res: Response): Response {
	const { Key, Options } = EnvVars.CookieProps;
	return res.clearCookie(Key, Options);
}
// **** Access Token **** //
/**
 * Add a JWT to the response
 * questo da fare di aggiungere il token  refresh e il token di accesso ritornato tramite payload
 */
async function addAccessToken(res: Response, data: ISessionUser): Promise<Response> {
	if (!res || !data) {
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
	}
	// Setup JWT access token
	const accessToken = await _sign(data, EnvVars.Jwt.Secret, AccessTokenOptions);
	// return the res with the token
	return res.json({ accessToken });
}

/**
 * Get token from request object's header (i.e. ISessionUser)
 */
function decodeAccessTokenData<T>(req: Request): Promise<string | T | undefined> {
	const authHeader = req.headers['authorization'];
	const jwt = (authHeader && authHeader.split(' ')[1]) || '';
	return _decode<T>(jwt, EnvVars.Jwt.Secret);
}

// here i implement the error handling for the cookies decoding for the object and return the session data
async function getAccessTokenSession(req: Request, res: Response): Promise<ISessionUser | undefined> {
	// get access token data from header
	const accessTokenData = await getDecodedToken<TSessionData>(req, res, decodeAccessTokenData);
	// check if is the correct type
	if (!accessTokenData || typeof accessTokenData !== 'object') return undefined;
	// return the session
	return extractUserInfo(accessTokenData);
}

// **** Helper Functions **** //

/**
 * Encrypt data and return jwt.
 */
function _sign(data: string | object | Buffer, secret: string, Options: object = {}): Promise<string> {
	return new Promise((res, rej) => {
		jsonwebtoken.sign(data, secret, Options, (err, token) => {
			return err ? rej(err) : res(token || '');
		});
	});
}

/**
 * Decrypt JWT and extract client data.
 */
function _decode<T>(jwt: string, secret: string): Promise<string | undefined | T> {
	return new Promise((res, rej) => {
		jsonwebtoken.verify(jwt, secret, (err, decoded) => {
			return err ? rej(Errors.Validation) : res(decoded as T);
		});
	});
}

// here i implement the error handling for the cookies decoding for the object and return the session data
async function getDecodedToken<T>(
	req: Request,
	res: Response,
	decode: <T>(req: Request) => Promise<string | T | undefined>
): Promise<string | T | undefined> {
	try {
		// decode the token depending on the decode function passed
		const accessTokenData = await decode<T>(req);

		if (accessTokenData !== null) {
			// return the session
			return accessTokenData;
		} else {
			logger.err(TOKEN_MALFORMED, false);
			res.status(HttpStatusCodes.CONFLICT).json({ error: TOKEN_MALFORMED });
		}
	} catch (err) {
		// if decoding the token fails, return an error
		logger.err(err, false);
		res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Refresh token expired or not valid' });
	}

	return undefined; // Return a default value if no valid session data was found
}

function extractUserInfo(session: TSessionData): ISessionUser {
	const data: ISessionUser = {
		id: session.id,
		email: session.email,
		name: session.name,
		role: session.role,
	};
	return data;
}

// **** Export default **** //

export default {
	addAccessToken,
	addRefreshToken,
	getAccessTokenSession,
	getRefreshTokenSession,
	getRefreshToken,
	refreshTokenExists,
	invalidateRefreshToken,
	clearCookie,
} as const;
