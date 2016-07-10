# oompa-token
An authentication middleware for Oompa

## Usage
```js
const Oompa = require('oompa');
const tokenize = require('oompa-token');
const schema = require('./schema');

const SECRET = 'foobar';

const server = new Oompa(schema);
server.use(tokenize(SECRET, 'LOGIN'));

server.listen(9000);
```

## Why?
Using `oompa-token` allows you to utilize JWT to cache expensive authentication procedures.

### `require('oompa-token')(secret:String, login:String, expiration:Optional<Integer>}`
- **secret** is the application secret used to sign and verify the JWT tokens. Keep it safe.
- **login** is the task type you use to authenticate users. This task should actually authenticate a user, and return the user object on a successful authentication.
- **expiration** is the optional expiration, in *seconds*, of a created token, after which authentication will fail.

### Side Effects
Every task that requires authentication must have a `token` key in its payload. Should the token be verified, the request will gain a `user` key with the user object.
