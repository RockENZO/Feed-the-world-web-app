const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const session=require('express-session');
const {sessionOptions,proxyTrust}=require('../config/runtime');

test('production secure sessions survive a trusted HTTPS proxy but refuse plain HTTP',async()=>{
  const env={NODE_ENV:'production',SESSION_SECRET:'x'.repeat(32)};
  const app=express();app.set('trust proxy',proxyTrust(env));
  const trust=app.get('trust proxy fn');
  assert.equal(trust('127.0.0.1',0),true);
  assert.equal(trust('203.0.113.10',0),false);
  app.use(session(sessionOptions(env)));
  app.get('/login',(req,res)=>{req.session.user={user_id:1};res.send('fixture login');});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  try {
    const url=`http://127.0.0.1:${server.address().port}/login`;
    const secure=await fetch(url,{headers:{'x-forwarded-proto':'https'}});
    assert.match(secure.headers.get('set-cookie'),/; Secure/);await secure.text();
    const plain=await fetch(url);
    assert.equal(plain.headers.get('set-cookie'),null);await plain.text();
  } finally {await new Promise(resolve=>server.close(resolve));}
});
