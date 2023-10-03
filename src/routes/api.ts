import { Router } from 'express';

import adminMw from './middleware/adminMw';
// import userMw from './middleware/userMw';
import Paths from '../constants/Paths';
import AuthRoutes from './AuthRoutes';
import UserRoutes from './UserRoutes';



// **** Variables **** //

const apiRouter = Router();


// **** Setup AuthRouter **** //

const authRouter = Router();

// Login user
authRouter.post(
  Paths.Auth.Login,
  AuthRoutes.login,
);

// Logout user
authRouter.get(
  Paths.Auth.Logout,
  AuthRoutes.logout,
);

// Request new access token
authRouter.get(
  Paths.Auth.Token,
  AuthRoutes.token,
);



// Add AuthRouter
apiRouter.use(Paths.Auth.Base, authRouter);


// ** Add UserRouter ** //

const userRouter = Router();

// Get all users
userRouter.get(
  Paths.Users.Get,
  UserRoutes.getAll,
);

// Get user by id
userRouter.get(
  Paths.Users.GetById,
  UserRoutes.getById,
);

// Add one user
userRouter.post(
  Paths.Users.Add,
  UserRoutes.add,
);

// Update one user
userRouter.put(
  Paths.Users.Update,
  UserRoutes.update,
);

// Delete one user
userRouter.delete(
  Paths.Users.Delete,
  UserRoutes.delete,
);

// Add UserRouter
// apiRouter.use(Paths.Users.Base, userRouter);
apiRouter.use(Paths.Users.Base, adminMw, userRouter);


// **** Export default **** //

export default apiRouter;
