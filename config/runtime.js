const {randomBytes}=require('node:crypto');

function sessionOptions(env=process.env) {
    const production=env.NODE_ENV==='production';
    if (production && (!env.SESSION_SECRET || env.SESSION_SECRET.length<32)) {
        throw new Error('Production requires a SESSION_SECRET of at least 32 characters');
    }
    return {
        resave:false, saveUninitialized:false,
        secret:env.SESSION_SECRET || randomBytes(32).toString('hex'),
        cookie:{secure:production,httpOnly:true,sameSite:'lax',maxAge:1000*60*60}
    };
}

function mailOptions(env=process.env) {
    if (!['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'].every(k=>env[k])) return null;
    const port=Number(env.SMTP_PORT || 587);
    if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('Invalid SMTP port');
    if (env.SMTP_SECURE && !['true','false'].includes(env.SMTP_SECURE)) throw new Error('Invalid SMTP_SECURE');
    const secure=env.SMTP_SECURE ? env.SMTP_SECURE==='true' : port===465;
    return {
        transport:{host:env.SMTP_HOST,port,secure,requireTLS:!secure,
            auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},
            disableFileAccess:true,disableUrlAccess:true},
        from:env.SMTP_FROM
    };
}

module.exports={sessionOptions,mailOptions};
