<div align="center">
  <!-- <img src="static/logo512x512.png" alt="Your Project Logo" width="160"> -->
  <h1>Express Auth OpenApi TS</h1>
  <p>A template to start your NodeJS Express APIs</p>
</div>
<br>

## 🚀 Features

- Authentication routes with login, logout, and token with refresh token authentication logic.
- Users routes with basic CRUD operations.
- Health check route.
- Uses Redis for storing id-refresh token pairs.
- Express-openapi-validator, Swagger-UI-Express, and Swagger-JSDoc for defining, validating, and visualizing API documentation.
- Basic front-end with all the logic needed to use the api.
- Tests for all the routes.

## 💻 Tech & Stuff used for this project 

![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)
![Express](https://img.shields.io/badge/Express-%23404D59.svg?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-%2361DAFB.svg?style=for-the-badge&logo=openapi-initiative&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jasmine](https://img.shields.io/badge/Jasmine-%238A4182.svg?style=for-the-badge&logo=jasmine&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-%23EB3C44.svg?style=for-the-badge)



## 🌎 OpenApi

### Where to place OpenApi definitions?

- `src/models/`: Define your data models here.
- `src/routes/`: Define your API routes here.
- `src/middleware/`: Define your reusable errors.

### API Documentation

Access the API documentation using Swagger at `http://localhost:3000/api/docs`.

## 👾 Available Scripts

### `npm run dev`

Run the server in development mode.

### `npm test`

Run all unit-tests with hot-reloading.

### `npm test -- --testFile="name of test file" (i.e. --testFile=Users).`

Run a single unit-test.

### `npm run test:no-reloading`

Run all unit-tests without hot-reloading.

### `npm run lint`

Check for linting errors.

### `npm run build`

Build the project for production.

### `npm start`

Run the production build (Must be built first).

### `npm start -- --env="name of env file" (default is production).`

Run production build with a different env file. 

## 🙌 Contributing

Contributions are welcome! If you have ideas, feedback, or want to report a bug, please open a [GitHub issue](https://github.com/Lupetti-Lorenzo/express-openapi-auth-ts/issues).

## 🙏 About

This project was created with [express-generator-typescript](https://github.com/seanpmaxwell/express-generator-typescript).

## 📄 License

This project is licensed under the [MIT License](LICENSE).