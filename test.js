import test from 'ava';
import jwt from 'jsonwebtoken';
import tokenize from '.';

const SECRET = 'foobar';

const authStub = request => new Promise((resolve, reject) => {
  if (request.payload.password === 'bar') {
    resolve(request.payload);
  } else {
    reject('Wrong creds');
  }
});

const mirror = ({payload}) => payload;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('Correct login | No expiration', async t => {
  const middleware = tokenize(SECRET, 'LOGIN');
  const login = {
    type: 'LOGIN',
    payload: {
      user: 'foo',
      password: 'bar',
    },
  };
  const {token} = await middleware(login, authStub);
  const {user} = await middleware({
    type: 'MIRROR',
    payload: {
      token,
    },
  }, mirror);
  t.is(user.user, 'foo');
  t.is(user.password, 'bar');
});

test('Correct login | Over expiration', async t => {
  const middleware = tokenize(SECRET, 'LOGIN', 0.5);
  const login = {
    type: 'LOGIN',
    payload: {
      user: 'foo',
      password: 'bar',
    },
  };
  const {token} = await middleware(login, authStub);
  await sleep(1000);
  try {
    await middleware({
      type: 'MIRROR',
      payload: {
        token,
      },
    }, mirror);
    t.fail('Token should have expired');
  } catch (err) {
    t.is(err.message, 'Expired token');
  }
});

test('No token, no action', async t => {
  const middleware = tokenize(SECRET, 'LOGIN');
  const resp = await middleware({
    type: 'MIRROR',
    payload: {
      foo: 'bar',
    },
  }, mirror);
  t.is(Object.keys(resp).length, 1);
  t.is(resp.foo, 'bar');
});