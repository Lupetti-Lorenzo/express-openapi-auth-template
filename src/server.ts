/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

// OPENAPI
import openApiSpec from './services/Swagger';
import * as swaggerUi from 'swagger-ui-express';
// import * as OpenApiValidator from 'express-openapi-validator';
// import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import Paths from '@src/constants/Paths';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';

// **** Variables **** //

const app = express();

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(EnvVars.CookieProps.Secret));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
	app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
	app.use(helmet());
}

// OPENAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
// SWAGGER UI ROUTE
// OPENAPI VALIDATOR MIDDELWARE
// app.use(
//   OpenApiValidator.middleware({
//     apiSpec: openapiSpecification as OpenAPIV3.Document, // Path to your OpenAPI specification
//     validateResponses: true,
//     validateRequests: true,
//   }),
// );

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use(
	(
		err: Error,
		_: Request,
		res: Response,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		next: NextFunction
	) => {
		if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
			logger.err(err, false);
		}
		let status = HttpStatusCodes.BAD_REQUEST;
		if (err instanceof RouteError) {
			status = err.status;
		}
		return res.status(status).json({ error: err.message });
	}
);

// **** Export default **** //

export default app;
