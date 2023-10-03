/**
 * Express router paths go here.
 */


export default {
  Base: '/api',
  Auth: {
    Base: '/auth',
    Login: '/login',
    Logout: '/logout',
    Token: '/token',
  },
  Users: {
    Base: '/users',
    Get: '/all',
    GetById: '/:id',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
} as const;
