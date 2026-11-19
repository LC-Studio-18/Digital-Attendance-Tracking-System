import { timingSafeEqual } from 'node:crypto';
import { getUsers } from '../services/sheetsService.js';

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const passwordsMatch = (provided, stored) => {
  const providedBuffer = Buffer.from(provided);
  const storedBuffer = Buffer.from(stored);

  return (
    providedBuffer.length === storedBuffer.length &&
    timingSafeEqual(providedBuffer, storedBuffer)
  );
};

export const checkEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        code: 'auth/invalid-email',
        message: 'Email is required.',
      });
    }

    const users = await getUsers();
    const exists = users.some(
      (candidate) => normalizeEmail(candidate.email) === email,
    );

    return res.status(200).json({ exists });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        code: 'auth/missing-credentials',
        message: 'Email and password are required.',
      });
    }

    const users = await getUsers();
    const user = users.find(
      (candidate) => normalizeEmail(candidate.email) === email,
    );

    if (!user || !passwordsMatch(password, user.password)) {
      return res.status(401).json({
        code: 'auth/invalid-credentials',
        message: 'Email or password is incorrect.',
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    return next(error);
  }
};
