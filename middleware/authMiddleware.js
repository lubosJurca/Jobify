import { UnauthenticatedError } from '../errors/customError.js';
import { verifyJWT } from '../utils/tokenUtils.js';

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  try {
    // this is going to verify the token and get the userId and role from it
    const { userId, role } = verifyJWT(token);
    const testUser = userId === '6686a057161b5ee35cb99973';
    // we create a user object with the userId and role in request
    req.user = { userId, role, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new UnauthenticatedError('Demo User. Read Only!');
  }
  next();
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthenticatedError('Not authorized to access this route');
    }
    next();
  };
};
