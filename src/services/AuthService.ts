import UserRepo from '@src/repos/UserRepo';
import TokenUtil from '@src/util/TokenUtil';

import PwdUtil from '@src/util/PwdUtil';
import { tick } from '@src/util/misc';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { RouteError } from '@src/other/classes';
import { ISessionUser, IUser } from '@src/models/User';
import { IReq, IRes } from '@src/routes/types/express/misc';
import RedisRepo from '@src/repos/RedisRepo';
import EnvVars from '@src/constants/EnvVars';

// **** Variables **** //

// Errors
export const Errors = {
	Unauth: 'Unauthorized',
	EmailNotFound(email: string) {
		return `User with email "${email}" not found`;
	},
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

/**
 * Login a user.
 */
async function login(email: string, password: string): Promise<IUser> {
	// Fetch user
	const user = await UserRepo.getOne(email);
	if (!user) {
		throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.EmailNotFound(email));
	}
	// Check password
	const hash = user.pwdHash ?? '',
		pwdPassed = await PwdUtil.compare(password, hash);
	if (!pwdPassed) {
		// If password failed, wait 500ms this will increase security
		await tick(500);
		throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.Unauth);
	}
	// Return
	return user;
}

/**
 * Logout a user.
 */
async function logout(req: IReq, res: IRes): Promise<IRes> {
	/// remove refresh token from local database and clear cookies
	await invalidateRefreshToken(req);
	TokenUtil.clearCookie(res);
	return res.status(HttpStatusCodes.OK).end();
}

/**
 * Add a JWT to the response
 * questo da fare di aggiungere il token  refresh e il token di accesso ritornato tramite payload
 */
async function addAccessToken(res: IRes, data: ISessionUser): Promise<IRes> {
	if (!res || !data) {
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
	}
	// Setup JWT access token
	const accessToken = await TokenUtil._sign(data, EnvVars.Jwt.Secret, AccessTokenOptions);
	// return the res with the token
	return res.status(HttpStatusCodes.OK).json({ accessToken });
}

/**
 * Add a JWT refresh token to cookies and database
 */
async function addRefreshToken(res: IRes, data: ISessionUser): Promise<IRes> {
	if (!res || !data || typeof data !== 'object') {
		throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
	}
	// Setup JWT
	const jwt = await TokenUtil._sign(data, EnvVars.Jwt.RefreshSecret, RefreshTokenOptions),
		{ Key, Options } = EnvVars.CookieProps;
	// set refresh token inside database
	await RedisRepo.setTokenById(String(data.id), jwt, Number(RefreshTokenOptions.expiresIn));
	// Return the res with the cookie set
	return res.cookie(Key, jwt, Options);
}

// invalidate the refresh token in the redis database
async function invalidateRefreshToken(req: IReq) {
	const sessionData = await TokenUtil.getRefreshTokenSession(req);
	// extract id from the token
	const id = String(sessionData.id);
	// invalidate refresh token
	await RedisRepo.revokeTokenById(id);
}

// validate the refresh token
async function validateRefreshToken(req: IReq): Promise<ISessionUser> {
	// get refresh token from cookies - automatically checks if it is valid
	const refreshTokenData = await TokenUtil.getRefreshTokenSession(req);
	// check redris cache if refresh token exists - if not is expired of not valid
	// (because after logout the jwt remains active and like this i can invalidate it)
	if (!RedisRepo.getTokenById(String(refreshTokenData.id)))
		throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Refresh token expired or not valid');
	return refreshTokenData;
}

// **** Export default **** //

export default {
	login,
	addRefreshToken,
	addAccessToken,
	validateRefreshToken,
	logout,
} as const;
