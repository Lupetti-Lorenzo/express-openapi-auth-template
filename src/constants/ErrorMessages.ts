export const USER_UNAUTHORIZED_ERR = 'User not authorized to perform this action';
export const USER_NOT_FOUND_ERR = 'User not found';
export const TOKEN_ERRORS = {
	ParamFalsey: 'Param is falsey',
	Validation: 'JSON-web-token validation failed.',
	Format: 'The format of the session is not an object',
} as const;
