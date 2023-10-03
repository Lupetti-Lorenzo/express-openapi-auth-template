import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import AuthService from '@src/services/AuthService';
import TokenUtil from '@src/util/TokenUtil';
import { TSessionData } from '@src/models/User';

import { IReq, IRes } from './types/express/misc';

// import { getRandomInt } from '@src/util/misc';
// import { ISessionUser } from '@src/models/User';


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
  // if (!TokenUtil.isRefreshTokenValid(req))
  //   return res.sendStatus(HttpStatusCodes.FORBIDDEN);
  // if it is valid, generate a new access token and return it
  // before i get data from the refresh token to generate the access token
  TokenUtil.getRefreshTokenData<TSessionData>(req)
    .then(async (refreshTokenData) => {
      // set access token inside body
      if (typeof refreshTokenData === 'object' && refreshTokenData !== null) {
        // add salt to get different token every time
        //data.salt = getRandomInt();
        // extract data from the token
        const data = {
          id: refreshTokenData.id,
          email: refreshTokenData.email,
          name: refreshTokenData.name,
          role: refreshTokenData.role,
        };

        res.status(HttpStatusCodes.OK);
        await TokenUtil.addAccessToken(res, data);
        // return success message
        return res.end();
      } else
        return res
          .status(HttpStatusCodes.CONFLICT)
          .json({ error: TOKEN_MALFORMED });
    })
    .catch((err) => {
      // if fails the decode of the token return an error
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: err });
    });
}

/**
 * Login a user.
 */
async function login(req: IReq<ILoginReq>, res: IRes) {
  const { email, password } = req.body;
  // Login
  const user = await AuthService.login(email, password);
  // Setup jwt data
  const data = {
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
