/**
 * Middleware to verify user logged in and is an an admin.
 */

import { Request, Response, NextFunction } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';

// import SessionUtil from '@src/util/SessionUtil';
import TokenUtil from '@src/util/TokenUtil';
import { UserRoles } from '@src/models/User';
import { USER_UNAUTHORIZED_ERR } from '@src/constants/ErrorMessages';

// **** Variables **** //

// **** Types **** //

// **** Functions **** //

/**
 * See note at beginning of file.
 */
// versione con access token
async function adminMw(req: Request, res: Response, next: NextFunction) {
	// Get session data
	const sessionData = await TokenUtil.getAccessTokenSession(req);
	// check permissions
	if (sessionData.role === UserRoles.Admin) {
		res.locals.sessionUser = sessionData;
		return next();
		// Return an unauth error if user is not an admin
	} else {
		return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: USER_UNAUTHORIZED_ERR });
	}
}

// **** Export Default **** //

export default adminMw;
