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
 * /users/all:
 *   get:
 *     tags:
 *     - user
 *     summary: Retrieve all users
 *     description: "This endpoint retrieves all users from the database."
 *     operationId: getAllUsers
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal Server Error
 */

async function getAll(_: IReq, res: IRes) {
	const users = await UserService.getAll();
	return res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Get user by id.
 */
/**
 * @openapi
 *
 * /users/{id}:
 *   get:
 *     tags:
 *     - user
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       '500':
 *         description: Internal Server Error
 */

async function getById(req: IReq, res: IRes) {
	const id = +req.params.id;
	const user = await UserService.getById(id);
	return res.status(HttpStatusCodes.OK).json({ user });
}

/**
 * Add one user.
 */
async function add(req: IReq<{ user: IUser }>, res: IRes) {
	const { user } = req.body;
	await UserService.addOne(user);
	return res.status(HttpStatusCodes.CREATED).json({ message: 'Utente creato' });
}

/**
 * Update one user.
 */
async function update(req: IReq<{ user: IUser }>, res: IRes) {
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
	getById,
	add,
	update,
	delete: delete_,
} as const;
