import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import AuthService from '@src/services/AuthService';
import TokenUtil from '@src/util/TokenUtil';
import logger from 'jet-logger';

import { ISessionUser, TSessionData } from '@src/models/User';
import { IReq, IRes } from './types/express/misc';
import { getRandomInt } from '@src/util/misc';
import { RouteError } from '@src/other/classes';

// **** Types **** //

interface ILoginReq {
	email: string;
	password: string;
}

// **** Variables **** //
export const TOKEN_MALFORMED = 'Refresh token provided is malformed.';

// **** Functions **** //

/**
 * @openapi
 * /token:
 *   get:
 *     summary: Generate a new access token from a valid refresh token inside cookies.
 *     description: |
 *       This endpoint checks if the provided refresh token is valid, and if so,
 *       generates a new access token associated with the user's data contained in the refresh token.
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The newly generated access token.
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating token validation failure.
 *       '403':
 *         description: Forbidden
 *     tags:
 *       - Authentication
 */

/**
 * Request a new access token.
 */

async function token(req: IReq, res: IRes) {
	// check if refresh token exists and if it is valid
	if (!TokenUtil.isRefreshTokenValid(req)) throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Refresh token expired or not valid');
	// if it is valid, generate a new access token and return it
	// before i get data from the refresh token to generate the access token
	TokenUtil.getRefreshTokenData<TSessionData>(req)
		.then(async (refreshTokenData) => {
			// set access token inside body
			if (typeof refreshTokenData === 'object' && refreshTokenData !== null) {
				// extract data from the token
				const data: ISessionUser = {
					id: refreshTokenData.id,
					email: refreshTokenData.email,
					name: refreshTokenData.name,
					role: refreshTokenData.role,
					salt: getRandomInt(), // add salt to get different access tokens every time
				};

				res.status(HttpStatusCodes.OK);
				await TokenUtil.addAccessToken(res, data);
				// return success message
				return res;
			} else {
				logger.err(TOKEN_MALFORMED, false);
				return res.status(HttpStatusCodes.CONFLICT).json({ error: TOKEN_MALFORMED });
			}
		})
		.catch((err) => {
			// if fails the decode of the token return an error
			logger.err(err, false);
			return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: err });
		});
}

/**
 * @openapi
 * /login:
 *   post:
 *     summary: User login
 *     description: |
 *       Logs in a user using their email and password. If the login is successful,
 *       it returns an access token in the response body and sets a refreshToken as a cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the authenticated user.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: |
 *                 The "Set-Cookie" header that contains the refreshToken as a cookie.
 *               example: refreshToken=exampleRefreshToken; Path=/; HttpOnly
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Usually an error due to token generation.
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating login failure.
 *       '500':
 *         description: Internal Server Error
 *     tags:
 *       - Authentication
 */

/**
 * Login a user.
 */
async function login(req: IReq<ILoginReq>, res: IRes) {
	const { email, password } = req.body;
	// Login
	const user = await AuthService.login(email, password);
	// Setup jwt data
	const data: ISessionUser = {
		id: user.id,
		email: user.name,
		name: user.name,
		role: user.role,
	};
	// this put the refresh token inside cookies and returns the access token inside the body
	res.status(HttpStatusCodes.OK);
	await TokenUtil.addRefreshToken(res, data);
	await TokenUtil.addAccessToken(res, data);
	// Return
	return res;
}

/**
 * @openapi
 * /logout:
 *   post:
 *     summary: Logs the user out, invalidates refresh token, and clears cookies.
 *     description: |
 *       This endpoint is used to log out a user and perform the following actions:
 *       - Invalidate the user's refresh token in the local database.
 *       - Clear the "refreshToken" cookie, if it exists.
 *     responses:
 *       '200':
 *         description: Successful logout.
 *       '401':
 *         description: Unauthorized - user not authenticated.
 *     tags:
 *       - Authentication
 */
/**
 * Logout the user. - qui manca di eliminare il refresh token dal db
 */
function logout(req: IReq, res: IRes) {
	// remove refresh token from local database and clear cookies
	TokenUtil.invalidateRefreshToken(req);
	TokenUtil.clearCookie(res);
	return res.status(HttpStatusCodes.OK).end();
}

// **** Export default **** //

export default {
	login,
	logout,
	token,
} as const;
