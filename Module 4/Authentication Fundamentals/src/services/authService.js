const bcrypt = require('bcryptjs');
const users = require('../repositories/userRepository');

const COST_FACTOR = Math.min(
  14,
  Math.max(10, Number.parseInt(process.env.BCRYPT_COST, 10) || 12)
);

// A valid dummy hash helps make unknown-email login failures
// perform comparable bcrypt work to wrong-password failures.
const dummyHashPromise = bcrypt.hash(
  'dummy-password-never-used-for-login',
  COST_FACTOR
);

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function badRequest() {
  return new AppError(400, 'INVALID_INPUT', 'Invalid request input');
}

function invalidCredentials() {
  return new AppError(
    401,
    'INVALID_CREDENTIALS',
    'Invalid email or password'
  );
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateFields(body, fields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw badRequest();
  }

  for (const field of fields) {
    if (
      typeof body[field] !== 'string' ||
      body[field].trim().length === 0
    ) {
      throw badRequest();
    }
  }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register(body) {
  validateFields(body, ['name', 'email', 'password']);

  const name = body.name.trim();
  const email = normalizeEmail(body.email);
  const password = body.password;

  const existingUser = await users.findByEmail(email);

  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_EXISTS',
      'An account with this email already exists'
    );
  }

  const passwordHash = await bcrypt.hash(password, COST_FACTOR);

  try {
    const user = await users.createUser({
      name,
      email,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    // The database unique constraint also protects against
    // two simultaneous registrations for the same email.
    if (error.code === 'P2002') {
      throw new AppError(
        409,
        'EMAIL_EXISTS',
        'An account with this email already exists'
      );
    }

    throw error;
  }
}

async function login(body) {
  validateFields(body, ['email', 'password']);

  const email = normalizeEmail(body.email);
  const password = body.password;

  const user = await users.findByEmail(email);

  if (!user) {
    const dummyHash = await dummyHashPromise;
    await bcrypt.compare(password, dummyHash);
    throw invalidCredentials();
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw invalidCredentials();
  }

  return safeUser(user);
}

async function findPublicById(id) {
  return users.findPublicById(id);
}

module.exports = {
  register,
  login,
  findPublicById,
};
