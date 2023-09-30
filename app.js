// FS
const path = require('path');
const fs = require('fs');
// Express
// const createError = require('http-errors');
const express = require('express');
// plugins
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// openapi doc e validator
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const expressOpenApiValidator = require('express-openapi-validator');
// routers
const indexRouter = require('./routes/index');
const helloRouter = require('./routes/hello');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Swagger UI at /api-docs
const swaggerOptions = JSON.parse(fs.readFileSync('./api-doc.json', 'utf8'));

const openapiSpecification = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// Initialize express-openapi-validator middleware
app.use(
  expressOpenApiValidator.middleware({
    apiSpec: openapiSpecification, // Path to your OpenAPI specification
    validateResponses: true,
    validateRequests: true,
  })
);

app.use('/', indexRouter);
app.use('/hello', helloRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;