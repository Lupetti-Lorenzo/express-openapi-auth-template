import swaggerJSDoc from 'swagger-jsdoc';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const myPackage = require('../../package.json');

// const { name, version, description, license, author } = myPackage;
const { name, version } = myPackage;

import EnvVars from '@src/constants/EnvVars';

const { Host, Port } = EnvVars;
const url = `https://${Host}:${Port}/api`;

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: name,
		version,
		// description,
		// license: { name: license, url: 'http://aminabbasi.com/licenses' },
		// contact: { name: author, email: 'amin.abbasi.rs@gmail.com' },
	},
	servers: [{ url: `${url}/` }],
	// basePath: '/api',
	// schemes: ['http', 'https'],
	consumes: ['application/json'],
	produces: ['application/json'],
	// host: url, // Host (optional)
	securityDefinitions: {
		JWT: {
			type: 'Bearer',
			in: 'header',
			name: 'Authorization',
			description: 'JWT Token for user authorization',
		},
	},
};

const options: swaggerJSDoc.Options = {
	swaggerDefinition: swaggerDefinition,
	// Path files to be processes. for: {openapi: '3.0.0'}
	apis: ['src/routes/*.ts', 'src/models/*.ts'],
};

const specs = swaggerJSDoc(options);

export default specs;
