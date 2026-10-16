const test=require('node:test');
const assert=require('node:assert/strict');
const nodemailer=require('nodemailer');

test('updated mailer renders the application plain-text message without network delivery',async()=>{
  const transporter=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});
  const result=await transporter.sendMail({from:'sender@example.invalid',to:'recipient@example.invalid',subject:'Subscription Confirmation',text:'Thank you for subscribing to our mailing list!'});
  assert.deepEqual(result.envelope.to,['recipient@example.invalid']);
  assert.match(result.message.toString(),/Thank you for subscribing/);
});

test('updated mysql2 performs a real parameterized round trip', {skip:!process.env.MYSQL_TEST_HOST},async()=>{
  const mysql=require('mysql2/promise');
  const connection=await mysql.createConnection({host:process.env.MYSQL_TEST_HOST,port:Number(process.env.MYSQL_TEST_PORT||3306),user:'app_test',password:process.env.MYSQL_TEST_PASSWORD,database:'usermanagement'});
  try {
    const [rows]=await connection.execute('SELECT ? AS value',[42]);
    assert.equal(rows[0].value,42);
  } finally {await connection.end();}
});
