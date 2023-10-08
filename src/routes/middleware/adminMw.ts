/**
 * Middleware to verify user logged in and is an an admin.
 */

import { Request, Response, NextFunction } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import TokenUtil from '@src/util/TokenUtil';
import { UserRoles } from '@src/models/User';

import { AuthErrors } from '@src/services/AuthService';

async function adminMw(req: Request, res: Response, next: NextFunction) {
	// Get session data
	const sessionData = await TokenUtil.getAccessTokenSession(req);
	// check permissions
	if (sessionData.role === UserRoles.Admin) {
		res.locals.sessionUser = sessionData;
		return next();
		// Return an unauth error if user is not an admin
	} else {
		return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: AuthErrors.Unauth });
	}
}

// **** Export Default **** //

export default adminMw;

// **** Define Responses returned by the middleware **** //

/**
 * @openapi
 * components:
 *   responses:
 *     BadRequestMiddleware:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Usually an error due to token verification.
 *                 example: JSON-web-token validation failed
 *
 *     UnauthorizedMiddleware:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: >
 *                   Error message indicating unauthorized behavior.
 *                   Define this in a Swagger doc comment for OpenAPI 3.0.0.
 *                 example: User not authorized to perform this action
 */
