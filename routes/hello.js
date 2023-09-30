const express = require('express');
const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Greeting:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 * /hello:
 *   get:
 *     summary: Get a normal greeting
 *     tags:
 *       - Greetings
 *     responses:
 *       '200':
 *         description: A greeting message
 *         content:
 *           'application/json':
 *             schema:
 *               $ref: '#/components/schemas/Greeting'
 */


/* GET greeting. */
router.get('/', function (req, res, next) {
  res.send({message: "ciao"});
});


/**
 * @swagger
 * /hello/{id}:
 *   get:
 *     summary: Get a greeting by ID
 *     tags:
 *       - Greetings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID for the greeting
 *     responses:
 *       200:
 *         description: A greeting message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Hello, {name}!"
 *       400:
 *         description: Bad request
 */


router.get('/:id', (req, res) => {
  const id = req.params.id; // Access the 'id' parameter from req.params

  // Use the 'id' parameter in your logic
  res.send(`Hello, ID: ${id}`);
});

/**
 * @swagger
 * /hello:
 *   post:
 *     summary: Get a greeting
 *     tags:
 *       - Greetings
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A greeting message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Ciao"
 */

/* POST greeting. */
router.post('/', function (req, res, next) {
    res.send('Ciao');
  });

module.exports = router;