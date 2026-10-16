const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const nodemailer=require('nodemailer');
const router=require('../routes/email');

test('missing SMTP configuration refuses delivery', async () => {
  const keys=['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'];
  const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  const create=nodemailer.createTransport;
  let created=false;
  keys.forEach(k=>delete process.env[k]);
  nodemailer.createTransport=()=>{created=true;return {sendMail:async()=>({messageId:'fixture'})};};
  const app=express();app.use(express.json());app.use('/email',router);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  try {
    const response=await fetch(`http://127.0.0.1:${server.address().port}/email/subscribe`,{
      method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'recipient@example.invalid'})
    });
    assert.equal(response.status,503);
    await response.text();
    assert.equal(created,false);
  } finally {
    nodemailer.createTransport=create;
    for(const k of keys) if(original[k]===undefined) delete process.env[k]; else process.env[k]=original[k];
    await new Promise(resolve=>server.close(resolve));
  }
});

test('configured delivery uses only supplied settings and rejects malformed recipients', async () => {
  const values={SMTP_HOST:'smtp.example.invalid',SMTP_USER:'fixture-user',SMTP_PASSWORD:'fixture-password',SMTP_FROM:'sender@example.invalid'};
  const original=Object.fromEntries(Object.keys(values).map(k=>[k,process.env[k]]));
  const create=nodemailer.createTransport;
  let transport,message,created=0;
  Object.assign(process.env,values);
  nodemailer.createTransport=options=>{created++;transport=options;return {sendMail:async mail=>{message=mail;return {messageId:'fixture'};}};};
  const app=express();app.use(express.json());app.use('/email',router);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const post=email=>fetch(`http://127.0.0.1:${server.address().port}/email/subscribe`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});
  try {
    for(const invalid of [undefined,{},'two@example.invalid,other@example.invalid','line\r\n@example.invalid']) {
      const response=await post(invalid);assert.equal(response.status,400);await response.text();
    }
    assert.equal(created,0);
    const response=await post('recipient@example.invalid');assert.equal(response.status,200);await response.text();
    assert.deepEqual(transport.auth,{user:values.SMTP_USER,pass:values.SMTP_PASSWORD});
    assert.equal(message.from,values.SMTP_FROM);assert.equal(message.to,'recipient@example.invalid');
    nodemailer.createTransport=()=>({sendMail:async()=>{throw new Error('smtp-secret');}});
    const failed=await post('recipient@example.invalid');assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('smtp-secret'));
  } finally {
    nodemailer.createTransport=create;
    for(const k of Object.keys(values)) if(original[k]===undefined) delete process.env[k]; else process.env[k]=original[k];
    await new Promise(resolve=>server.close(resolve));
  }
});
