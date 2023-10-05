import UserRepo from '@src/repos/UserRepo';
import { IUser } from '@src/models/User';
import { RouteError } from '@src/other/classes';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { USER_NOT_FOUND_ERR } from '@src/constants/ErrorMessages';

// **** Variables **** //

// **** Functions **** //

/**
 * Get all users.
 */
function getAll(): Promise<IUser[]> {
	return UserRepo.getAll();
}

/**
 * Get user by id.
 */
async function getById(id: number): Promise<IUser | null> {
	if (!id) throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'The following parameter was missing or invalid: "id".');
	const persists = await UserRepo.persists(id);
	if (!persists) {
		throw new RouteError(HttpStatusCodes.NOT_FOUND, USER_NOT_FOUND_ERR);
	}
	// Return user
	return UserRepo.getById(id);
}

/**
 * Add one user.
 */
function addOne(user: IUser): Promise<void> {
	if (!user) throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'The following parameter was missing or invalid: "user".');
	return UserRepo.add(user);
}

/**
 * Update one user.
 */
async function updateOne(user: IUser): Promise<void> {
	if (!user) throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'The following parameter was missing or invalid: "user".');
	const persists = await UserRepo.persists(user.id);
	if (!persists) {
		throw new RouteError(HttpStatusCodes.NOT_FOUND, USER_NOT_FOUND_ERR);
	}
	// Return user
	return UserRepo.update(user);
}

/**
 * Delete a user by their id.
 */
async function _delete(id: number): Promise<void> {
	if (!id) throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'The following parameter was missing or invalid: "id".');

	const persists = await UserRepo.persists(id);
	if (!persists) {
		throw new RouteError(HttpStatusCodes.NOT_FOUND, USER_NOT_FOUND_ERR);
	}
	// Delete user
	return UserRepo.delete(id);
}

// **** Export default **** //

export default {
	getAll,
	getById,
	addOne,
	updateOne,
	delete: _delete,
} as const;
