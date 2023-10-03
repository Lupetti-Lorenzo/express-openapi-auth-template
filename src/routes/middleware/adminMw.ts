/**
 * Middleware to verify user logged in and is an an admin.
 */

import { Request, Response, NextFunction } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';

// import SessionUtil from '@src/util/SessionUtil';
import TokenUtil from '@src/util/TokenUtil';
import { TSessionData, UserRoles } from '@src/models/User';
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
  TokenUtil.getAccessTokenData<TSessionData>(req)
    .then((sessionData) => {
      // Set session data to locals
      if (
        typeof sessionData === 'object' &&
        sessionData?.role === UserRoles.Admin
      ) {
        res.locals.sessionUser = sessionData;
        return next();
        // Return an unauth error if user is not an admin
      } else {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ error: USER_UNAUTHORIZED_ERR });
      }
    })
    .catch((err) => {
      // if fails the decode of the token return an error
      return res.status(HttpStatusCodes.FORBIDDEN).json({ error: err });
    });
}


// **** Export Default **** //

export default adminMw;
