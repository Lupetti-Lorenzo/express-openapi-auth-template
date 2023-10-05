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
 *     - User
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
 *       '400':
 *         $ref: '#/components/responses/BadRequestMiddleware'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedMiddleware'
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
 *     - User
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
 *       '400':
 *         $ref: '#/components/responses/BadRequestMiddleware'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedMiddleware'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
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
/**
 * @openapi
 *
 * /users/add:
 *   post:
 *     tags:
 *     - User
 *     summary: Add a user
 *     requestBody:
 *       description: User object to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created
 *       '400':
 *         $ref: '#/components/responses/BadRequestMiddleware'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedMiddleware'
 *       '500':
 *         description: Internal Server Error
 */
async function add(req: IReq<{ user: IUser }>, res: IRes) {
	const { user } = req.body;
	await UserService.addOne(user);
	return res.status(HttpStatusCodes.CREATED).json({ message: 'User created' });
}

/**
 * Update one user.
 */
/**
 * @openapi
 *
 * /users/update:
 *   put:
 *     tags:
 *     - User
 *     summary: Update a user
 *     requestBody:
 *       description: User object to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *       '400':
 *         $ref: '#/components/responses/BadRequestMiddleware'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedMiddleware'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 *       '500':
 *         description: Internal Server Error
 */
async function update(req: IReq<{ user: IUser }>, res: IRes) {
	const { user } = req.body;
	await UserService.updateOne(user);
	return res.status(HttpStatusCodes.OK).json({ message: 'User updated successfully' });
}

/**
 * Delete one user.
 */
/**
 * @openapi
 *
 * /users/{id}:
 *   delete:
 *     tags:
 *     - User
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       '400':
 *         $ref: '#/components/responses/BadRequestMiddleware'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedMiddleware'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 *       '500':
 *         description: Internal Server Error
 */
async function delete_(req: IReq, res: IRes) {
	const id = +req.params.id;
	await UserService.delete(id);
	return res.status(HttpStatusCodes.OK).json({ message: 'User deleted successfully' });
}

// **** Export default **** //

export default {
	getAll,
	getById,
	add,
	update,
	delete: delete_,
} as const;

/**
 * @openapi
 * components:
 *   responses:
 *     UserNotFound:
 *       description: User not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: The id provided does not match any user
 *
 */
