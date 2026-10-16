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
