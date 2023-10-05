import { Router } from 'express';

import adminMw from './middleware/adminMw';
import Paths from '../constants/Paths';
import AuthRoutes from './AuthRoutes';
import UserRoutes from './UserRoutes';
import HealthRoutes from './HealthRoutes';

// **** Variables **** //

const apiRouter = Router();

// **** Setup AuthRouter **** //

const authRouter = Router();

// Login user
authRouter.post(Paths.Auth.Login, AuthRoutes.login);

// Logout user
authRouter.get(Paths.Auth.Logout, AuthRoutes.logout);

// Request new access token
authRouter.get(Paths.Auth.Token, AuthRoutes.token);

// Add AuthRouter
apiRouter.use(Paths.Auth.Base, authRouter);

// ** Add UserRouter ** //

const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);

// Get user by id
userRouter.get(Paths.Users.GetById, UserRoutes.getById);

// Add one user
userRouter.post(Paths.Users.Add, UserRoutes.add);

// Update one user
userRouter.put(Paths.Users.Update, UserRoutes.update);

// Delete one user
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, adminMw, userRouter);

// **** Health Check **** //
const healthRouter = Router();

healthRouter.get(Paths.HealthCheck, HealthRoutes.healthcheck);
// add healthRouter
apiRouter.use(healthRouter);

// **** Export default **** //

export default apiRouter;
