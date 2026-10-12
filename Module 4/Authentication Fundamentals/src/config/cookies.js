const isProduction = process.env.NODE_ENV === 'production';

const secure = process.env.COOKIE_SECURE === undefined
  ? isProduction
  : process.env.COOKIE_SECURE === 'true';

const cookieOptions = {
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  signed: true,
};

function setCookieOptions() {
  return {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000,
  };
}

module.exports = { cookieOptions, setCookieOptions };
