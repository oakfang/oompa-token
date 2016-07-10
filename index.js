const jwt = require('jsonwebtoken');

/**
 * @param secret:String application secret
 * @param login:String application's authentication task type
 * @param [expiration:Integer] how long should a token last (default: forever)
 */
module.exports = (secret, login, expiration) => (request, next) => {
  if (request.type === login) {
    return next(request).then(user => {
      const token = jwt.sign(user, secret);
      return Object.assign({}, user, {token});
    });
  }
  if ('token' in request.payload) {
    const token = request.payload.token;
    const user = jwt.verify(token, secret);
    if (expiration) {
      const age = Math.floor((new Date()) / 1000) - user.iat;
      if (age > expiration) {
        throw new Error('Expired token');
      }
    }
    request.payload.user = user;
    return next(request);
  }
  return next(request);
};