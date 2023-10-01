import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import UserService from '@src/services/UserService';
import { IUser } from '@src/models/User';
import { IReq, IRes } from './types/express/misc';


// **** Functions **** //

/**
 * Get all users.
 */

/**
 * @openapi
 *
 * /api/users/all:
 *   get:
 *     tags:
 *     - user
 *     summary: Logs out the current logged-in user session
 *     description: "This is a sample description for the endpoint."  # Updated description here
 *     operationId: logoutUser
 *     parameters:
 *     - name: username
 *       in: query   # Set the parameter location to 'query'
 *       description: 'The name that needs to be fetched. Use user1 for testing. '
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       default:
 *         description: successful operation
 */


async function getAll(_: IReq, res: IRes) {
  const users = await UserService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Add one user.
 */
async function add(req: IReq<{user: IUser}>, res: IRes) {
  const { user } = req.body;
  await UserService.addOne(user);
  return res.status(HttpStatusCodes.CREATED).json({message: 'Utente creato'});
}

/**
 * Update one user.
 */
async function update(req: IReq<{user: IUser}>, res: IRes) {
  const { user } = req.body;
  await UserService.updateOne(user);
  return res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one user.
 */
async function delete_(req: IReq, res: IRes) {
  const id = +req.params.id;
  await UserService.delete(id);
  return res.status(HttpStatusCodes.OK).end();
}


// **** Export default **** //

export default {
  getAll,
  add,
  update,
  delete: delete_,
} as const;
