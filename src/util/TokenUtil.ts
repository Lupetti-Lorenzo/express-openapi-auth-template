import { Request, Response } from 'express';

import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { RouteError } from '@src/other/classes';
import jsonwebtoken from 'jsonwebtoken';

import EnvVars from '../constants/EnvVars';

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

const refreshTokens: string[] = [];

// **** Functions **** //

/**
 * Get session data from request object (i.e. ISessionUser)
 */

function getRefreshTokenData<T>(req: Request): Promise<string | T | undefined> {
  const { Key } = EnvVars.CookieProps,
    jwt = req.signedCookies[Key];
  return _decode(jwt, EnvVars.Jwt.RefreshSecret);
}

function getRefreshToken(req: Request): string | undefined {
  const { Key } = EnvVars.CookieProps,
    jwt = req.signedCookies[Key];
  return jwt;
}

function isRefreshTokenValid(req: Request): boolean {
  const refreshToken = getRefreshToken(req) || '';
  return refreshTokens.indexOf(refreshToken) !== -1;
}

/**
 * Add a JWT refresh token to cookies and database
 */
async function addRefreshToken(
  res: Response,
  data: string | object
): Promise<Response> {
  if (!res || !data) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
  }
  // Setup JWT
  const jwt = await _sign(data, EnvVars.Jwt.RefreshSecret, RefreshTokenOptions),
    { Key, Options } = EnvVars.CookieProps;
  // set refresh token inside database
  refreshTokens.push(jwt);
  // Return
  return res.cookie(Key, jwt, Options);
}


function invalidateRefreshToken(req: Request) {
  const refreshToken = getRefreshToken(req) || '';
  refreshTokens.splice(refreshTokens.indexOf(refreshToken), 1);
}

/**
 * Remove cookie
 */
function clearCookie(res: Response): Response {
  const { Key, Options } = EnvVars.CookieProps;
  return res.clearCookie(Key, Options);
}


/**
 * Get token from request object's header (i.e. ISessionUser)
 */
function getAccessTokenData<T>(req: Request): Promise<string | T | undefined> {
  const authHeader = req.headers['authorization'];
  const jwt = (authHeader && authHeader.split(' ')[1]) || '';
  return _decode(jwt, EnvVars.Jwt.Secret);
}

/**
 * Add a JWT to the response
 * questo da fare di aggiungere il token  refresh e il token di accesso ritornato tramite payload
 */
async function addAccessToken(
  res: Response,
  data: string | object
): Promise<Response> {
  if (!res || !data) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);
  }
  // Setup JWT access token
  const accessToken = await _sign(data, EnvVars.Jwt.Secret, AccessTokenOptions);
  // return the res with the token
  return res.json({ accessToken });
}

// **** Helper Functions **** //

/**
 * Encrypt data and return jwt.
 */
function _sign(
  data: string | object | Buffer,
  secret: string,
  Options: object = {},
): Promise<string> {
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

// **** Export default **** //

export default {
  addAccessToken,
  addRefreshToken,
  getAccessTokenData,
  getRefreshTokenData,
  getRefreshToken,
  isRefreshTokenValid,
  invalidateRefreshToken,
  clearCookie,
} as const;
