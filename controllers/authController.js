import { StatusCodes } from 'http-status-codes';
import User from '../models/UserModel.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { UnauthorizedError } from '../errors/customError.js';
import { createJWT } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  // this is going to check if the user is first in the database and if so, it will automatically make him an admin
  const isFirstUser = (await User.countDocuments()) === 0;
  req.body.role = isFirstUser ? 'admin' : 'user';

  // this is going to hash the password
  req.body.password = await hashPassword(req.body.password);

  // this is going to create the user
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: 'user created' });
};
export const login = async (req, res) => {
  // this is going to check if the user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new UnauthorizedError('invalid credentials');
  }

  // this is going to check if the password is correct.
  const isPasswordCorrect = await comparePassword(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new UnauthorizedError('invalid credentials');
  }
  // this is going to create the token
  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  // this is going to set the cookie
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });
  // this is going to send the response
  res.status(StatusCodes.CREATED).json({ msg: 'user logged in' });
};

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out' });
};
