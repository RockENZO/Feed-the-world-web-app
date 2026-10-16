const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const session = require('express-session');
const signature = require('cookie-signature');
const users = require('../routes/users');
const branches = require('../routes/branches');
const posts = require('../routes/posts');
const events = require('../routes/events');

const operations = [
  ['PUT', '/users/2', {role:'Admin'}],
  ['POST', '/users/branches/1/users', {user_id:2}],
  ['DELETE', '/users/1/users/2', {}],
  ['POST', '/branches', {name:'Test'}],
  ['DELETE', '/branches/1', {}],
  ['POST', '/branches/1/users', {name:'Test',role:'Admin',email:'test@example.invalid'}],
  ['DELETE', '/branches/1/users/2', {}],
];

async function withApp(user, databaseRole, exercise, failLookup=false, managedBranch=true) {
  const app = express();
  const store = new session.MemoryStore();
  const queries = [];
  store.set('fixture', {cookie:{maxAge:60000},user});
  app.use(express.json());
  app.use(session({secret:'test-only-secret',store,resave:false,saveUninitialized:false}));
  app.use((req,res,next) => {
    function query(sql,params,callback) {
      if (typeof params === 'function') {callback=params;params=[];}
      queries.push({sql,params});
      if (sql.startsWith('SELECT role')) {
        return callback(failLookup ? new Error('database-secret') : null,
                        databaseRole ? [{role:databaseRole}] : []);
      }
      if (sql.startsWith('SELECT b.branch_id')) return callback(null, databaseRole==='Manager' && managedBranch ? [{branch_id:1}] : []);
      callback(null,{affectedRows:1,insertId:2});
    }
    req.pool = {query,getConnection(callback){callback(null,{query,release(){}});}};
    next();
  });
  app.use('/users',users);
  app.use('/branches',branches);
  app.use('/posts',posts);
  app.use('/events',events);
  const server = await new Promise(resolve => {
    const listener=app.listen(0,'127.0.0.1',()=>resolve(listener));
  });
  const cookie='connect.sid='+encodeURIComponent('s:'+signature.sign('fixture','test-only-secret'));
  try {
    await exercise(async (method,path,body) => fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,headers:{cookie,'content-type':'application/json'},body:JSON.stringify(body)
    }), queries);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('anonymous requests cannot mutate users or branches', async () => {
  await withApp(undefined,undefined,async (request,queries) => {
    for (const [method,path,body] of operations) {
      const response=await request(method,path,body);
      assert.equal(response.status,401,`${method} ${path}`);
      await response.text();
    }
    assert.deepEqual(queries,[]);
  });
});

test('current database role overrides a stale Admin session and supplied body roles', async () => {
  await withApp({user_id:1,role:'Admin'},'User',async (request,queries) => {
    for (const [method,path,body] of operations) {
      const response=await request(method,path,{...body,role:'Admin',user_id:999});
      assert.equal(response.status,403,`${method} ${path}`);
      await response.text();
    }
    assert.equal(queries.length,operations.length);
    assert.ok(queries.every(q=>q.sql.startsWith('SELECT role') && q.params[0]===1));
  });
});

test('verified database administrators can reach each mutation', async () => {
  await withApp({user_id:1,role:'User'},'Admin',async (request,queries) => {
    for (const [method,path,body] of operations) {
      const response=await request(method,path,body);
      assert.equal(response.status,200,`${method} ${path}`);
      await response.text();
    }
    assert.equal(queries.filter(q=>q.sql.startsWith('SELECT role')).length,operations.length);
    assert.ok(queries.some(q=>q.sql.startsWith('UPDATE Users')));
  });
});

test('failed authorization lookup denies writes without exposing backend errors', async () => {
  await withApp({user_id:1,role:'Admin'},'Admin',async (request,queries) => {
    const response=await request('PUT','/users/2',{role:'Admin'});
    assert.equal(response.status,503);
    assert.ok(!(await response.text()).includes('database-secret'));
    assert.equal(queries.length,1);
  },true);
});

test('anonymous publishing and RSVP writes are denied before database access', async () => {
  await withApp(undefined,undefined,async (request,queries) => {
    for (const path of ['/posts/addPost','/events/addEvent','/events/setRsvp']) {
      const response=await request('POST',path,{content:'x',title:'x',branch:1,user:999,eventId:1});
      assert.equal(response.status,401,path);
      await response.text();
    }
    assert.deepEqual(queries,[]);
  });
});

test('publishing requires current Manager role and branch ownership', async () => {
  for (const [role,managed] of [['User',true],['Manager',false]]) {
    await withApp({user_id:42,role:'Manager'},role,async (request,queries) => {
      for (const path of ['/posts/addPost','/events/addEvent']) {
        const response=await request('POST',path,{content:'x',title:'x',branch:1,user:999});
        assert.equal(response.status,403,path);
        await response.text();
      }
      assert.ok(queries.every(q=>q.sql.startsWith('SELECT b.branch_id') && q.params[0]===42));
    },false,managed);
  }
});

test('authorized publishing uses the server identity and verified branch', async () => {
  await withApp({user_id:42,role:'Manager'},'Manager',async (request,queries) => {
    for (const path of ['/posts/addPost','/events/addEvent']) {
      const response=await request('POST',path,{content:'x',title:'x',branch:1,user:999});
      assert.equal(response.status,200,path);
      await response.text();
    }
    const post=queries.find(q=>q.sql.startsWith('INSERT INTO Posts'));
    assert.deepEqual(post.params,['x',1,42]);
    const event=queries.find(q=>q.sql.startsWith('INSERT INTO Events'));
    assert.deepEqual(event.params,['x','x',1]);
  });
});
