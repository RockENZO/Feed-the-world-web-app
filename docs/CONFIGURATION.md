# Session and mail configuration

The app reads process environment variables. It does not automatically load `.env` files. Keep private files untracked; `.env.example` lists available settings.

- Development without `SESSION_SECRET` generates a fresh random secret. Production (`NODE_ENV=production`) refuses startup without a secret of at least32 characters. Generate one privately, for example with `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.
- Production session cookies require HTTPS and use HttpOnly and SameSite=Lax. A reverse proxy needs a separately reviewed trust/HTTPS setup. The default memory session store is for development; these changes do not certify a production deployment.
- Mail is disabled unless `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` are all set. `SMTP_PORT` defaults to587;465 selects direct TLS unless overridden by `SMTP_SECURE`. Non-direct-TLS transports require STARTTLS. Certificate verification remains enabled.
- Mail delivery tests use a stub and never contact an SMTP service. Verify actual provider settings separately before use.

The old source contained fixed session and SMTP credentials. Removing them from current code does not revoke them at the provider. Rotate/revoke any previously published SMTP credential if that account is still used; historical Git commits may still contain it.
