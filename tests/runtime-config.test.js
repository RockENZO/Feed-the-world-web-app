const test=require('node:test');
const assert=require('node:assert/strict');
const {sessionOptions,mailOptions}=require('../config/runtime');

test('production requires a non-default strong session secret',()=>{
  assert.throws(()=>sessionOptions({NODE_ENV:'production'}),/SESSION_SECRET/);
  assert.throws(()=>sessionOptions({NODE_ENV:'production',SESSION_SECRET:'short'}),/SESSION_SECRET/);
  const options=sessionOptions({NODE_ENV:'production',SESSION_SECRET:'x'.repeat(32)});
  assert.equal(options.secret,'x'.repeat(32));
  assert.equal(options.cookie.secure,true);
  assert.equal(options.cookie.httpOnly,true);
  assert.equal(options.cookie.sameSite,'lax');
  assert.equal(options.saveUninitialized,false);
});

test('development secrets are generated independently and HTTP remains usable',()=>{
  const a=sessionOptions({}), b=sessionOptions({});
  assert.notEqual(a.secret,b.secret);
  assert.ok(a.secret.length>=32);
  assert.equal(a.cookie.secure,false);
});

test('mail transport requires explicit credentials and preserves TLS validation',()=>{
  assert.equal(mailOptions({}),null);
  const env={SMTP_HOST:'smtp.example.invalid',SMTP_USER:'fixture-user',SMTP_PASSWORD:'fixture-password',SMTP_FROM:'sender@example.invalid'};
  const options=mailOptions(env);
  assert.equal(options.transport.host,env.SMTP_HOST);
  assert.deepEqual(options.transport.auth,{user:env.SMTP_USER,pass:env.SMTP_PASSWORD});
  assert.equal(options.transport.requireTLS,true);
  assert.equal(options.transport.secure,false);
  assert.equal(mailOptions({...env,SMTP_PORT:'465'}).transport.secure,true);
  assert.throws(()=>mailOptions({...env,SMTP_PORT:'invalid'}),/port/);
  assert.throws(()=>mailOptions({...env,SMTP_SECURE:'invalid'}),/SECURE/);
});
