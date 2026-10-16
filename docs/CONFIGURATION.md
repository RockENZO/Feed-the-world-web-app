# Session and mail configuration

The app reads process environment variables. It does not automatically load `.env` files. Keep private files untracked; `.env.example` lists available settings.

- Development without `SESSION_SECRET` generates a fresh random secret. Production (`NODE_ENV=production`) refuses startup without a secret of at least 32 characters. Generate one privately, for example with `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.
- Production session cookies require HTTPS and use HttpOnly and SameSite=Lax. Production defaults to a same-host HTTPS reverse proxy (`TRUST_PROXY=loopback`); remote clients cannot supply trusted forwarding headers. `TRUST_PROXY=false` disables forwarding trust. Other proxy layouts need an explicit implementation review rather than trusting arbitrary headers. The default memory session store is for development; these changes do not certify a production deployment.
- Mail is disabled unless `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` are all set. `SMTP_PORT` defaults to 587; port 465 selects direct TLS unless overridden by `SMTP_SECURE`. Non-direct-TLS transports require STARTTLS. Certificate verification remains enabled.
- Confirmation mail requires a signed-in user and is sent only to the email in the server session. One attempt per user per minute is allowed in this single-process development runtime; a distributed deployment needs a shared limit store.
- Mail delivery tests use a stub and never contact an SMTP service. Verify actual provider settings separately before use.

The old source contained fixed session and SMTP credentials. Removing them from current code does not revoke them at the provider. Rotate/revoke any previously published SMTP credential if that account is still used; historical Git commits may still contain it.
