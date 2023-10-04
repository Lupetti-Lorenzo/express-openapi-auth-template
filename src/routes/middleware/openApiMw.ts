/**
 * Middleware every request against the documentation
 */
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import openApiSpec from '@src/services/Swagger';

const openApiMw = OpenApiValidator.middleware({
	apiSpec: openApiSpec as OpenAPIV3.Document, // Path to your OpenAPI specification
	validateResponses: true,
	validateRequests: true,
});

export default openApiMw;
