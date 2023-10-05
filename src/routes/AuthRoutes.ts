import AuthService from '@src/services/AuthService';

import { ISessionUser } from '@src/models/User';
import { IReq, IRes } from './types/express/misc';
import { getRandomInt } from '@src/util/misc';

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
 * /auth/token:
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
 *                   example: The newly generated access token for the authenticated user.
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error message indicating token validation failure.
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Refresh token expired or not valid.
 *       '500':
 *         description: Internal Server Error
 *     tags:
 *       - Authentication
 */

/**
 * Request a new access token.
 */

async function token(req: IReq, res: IRes) {
	const refreshTokenData = await AuthService.validateRefreshToken(req);
	// if it is valid, generate a new access token and return it
	// add salt to get different access tokens every time
	refreshTokenData.salt = getRandomInt();
	// return success message and add the access token to the response
	return await AuthService.addAccessToken(res, refreshTokenData);
}

/**
 * @openapi
 * /auth/login:
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
 *                   example: The access token for the authenticated user.
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
 *                   example: Usually an error due to token generation.
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error message indicating login failure.
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
	await AuthService.addRefreshToken(res, data);
	await AuthService.addAccessToken(res, data);
	// Return
	return res;
}

/**
 * @openapi
 * /auth/logout:
 *   get:
 *     summary: Logs the user out, invalidates refresh token, and clears cookies.
 *     description: |
 *       This endpoint is used to log out a user and perform the following actions:
 *       - Invalidate the user's refresh token in the local database.
 *       - Clear the "refreshToken" cookie, if it exists.
 *     responses:
 *       '200':
 *         description: Successful logout.
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usually an error due to token expired or not privided.
 *       '500':
 *         description: Internal Server Error
 *     tags:
 *       - Authentication
 */
/**
 * Logout the user. - qui manca di eliminare il refresh token dal db
 */
async function logout(req: IReq, res: IRes) {
	// remove refresh token from local database and clear cookies
	return await AuthService.logout(req, res);
}

// **** Export default **** //

export default {
	login,
	logout,
	token,
} as const;
