import { Request, Response } from 'express';

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health Check
 *     description: |
 *       Check the health of the API.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds.
 *                 message:
 *                   type: string
 *                   description: Health check message.
 *                   example: Ok
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Current date and time.
 *       '500':
 *         description: Internal Server Error
 *     tags:
 *       - Health Check
 */

async function healthcheck(_: Request, res: Response) {
	const data = {
		uptime: process.uptime(),
		message: 'Ok',
		date: new Date(),
	};

	return res.status(200).json(data);
}

export default { healthcheck } as const;
