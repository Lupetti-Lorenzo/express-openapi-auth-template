import { Request, Response } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import jsonwebtoken from 'jsonwebtoken';

import EnvVars from '../constants/EnvVars';
import { ISessionUser, TSessionData } from '@src/models/User';
import { RouteError } from '@src/other/classes';

import { AuthErrors } from '@src/services/AuthService';

// **** Variables **** //

// **** Functions **** //

// **** Refresh Token **** //
// returns the refresh token data that can be string or object from the request but is a promise that can be rejected
function decodeRefreshTokenCookies<T>(req: Request): Promise<string | T | undefined> {
	const { Key } = EnvVars.CookieProps,
		jwt = req.signedCookies[Key];
	return _decode<T>(jwt, EnvVars.Jwt.RefreshSecret);
}

// here i implement the error handling for the cookies decoding for the object and return the session data
async function getRefreshTokenSession(req: Request): Promise<ISessionUser> {
	// get access token data from header
	const accessTokenData = await getDecodedToken<TSessionData>(req, decodeRefreshTokenCookies);
	// check if is the correct type
	if (!accessTokenData || typeof accessTokenData !== 'object')
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, AuthErrors.Validation);
	// return the session
	return extractUserInfo(accessTokenData);
}

// returns the refresh token from the request
// function getRefreshToken(req: Request): string | undefined {
// 	const { Key } = EnvVars.CookieProps,
// 		jwt = req.signedCookies[Key];
// 	return jwt;
// }

// **** Access Token **** //

/**
 * Get token from request object's header (i.e. ISessionUser)
 */
function decodeAccessTokenHeaders<T>(req: Request): Promise<string | T | undefined> {
	const authHeader = req.headers['authorization'];
	const jwt = (authHeader && authHeader.split(' ')[1]) || '';
	return _decode<T>(jwt, EnvVars.Jwt.Secret);
}

// here i implement the error handling for the cookies decoding for the object and return the session data
async function getAccessTokenSession(req: Request): Promise<ISessionUser> {
	// get access token data from header
	const accessTokenData = await getDecodedToken<TSessionData>(req, decodeAccessTokenHeaders);
	// check if is the correct type
	if (!accessTokenData || typeof accessTokenData !== 'object')
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, AuthErrors.Validation);
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
			return err ? rej(AuthErrors.Validation) : res(decoded as T);
		});
	});
}

// here i implement the error handling for the cookies decoding for the object and return the session data
async function getDecodedToken<T>(
	req: Request,
	decode: <T>(req: Request) => Promise<string | T | undefined>
): Promise<string | T | undefined> {
	try {
		// decode the token depending on the decode function passed
		const accessTokenData = await decode<T>(req);

		if (accessTokenData !== null) {
			// return the session
			return accessTokenData;
		}
	} catch (err) {
		// if decoding the token fails, return an error
	}
	return undefined;
}

// clear the cookie from the response
function clearCookie(res: Response): Response {
	const { Key, Options } = EnvVars.CookieProps;
	return res.clearCookie(Key, Options);
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
	getAccessTokenSession,
	getRefreshTokenSession,
	// getRefreshToken,
	clearCookie,
	_sign,
	extractUserInfo,
} as const;
