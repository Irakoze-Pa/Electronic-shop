# Authentication and administrator bootstrap

The API uses a short-lived JWT access token stored in an `HttpOnly` cookie. The
browser sends the cookie through the shared Axios client with
`withCredentials: true`; frontend code cannot read the token. The cookie is
`SameSite=Strict`, uses `Secure` in production, and expires with the JWT.

This is safer than local storage because injected browser JavaScript cannot
read the token. The tradeoff is that the storefront and API must be deployed in
a cookie-compatible same-site arrangement. If they are intentionally hosted on
different sites, configure a cross-site cookie and add explicit CSRF protection
before deployment.

## Required server environment

Set these values in `server/.env`:

```dotenv
JWT_SECRET=<a unique random value containing at least 32 characters>
JWT_EXPIRES_IN=3600
```

`JWT_EXPIRES_IN` is measured in seconds. A secret can be generated with:

```sh
openssl rand -base64 48
```

## Create the first Admin

There is no public Admin registration endpoint. Add the following temporary
values to `server/.env`:

```dotenv
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=<a password with uppercase, lowercase, and a number>
INITIAL_ADMIN_FIRST_NAME=Store
INITIAL_ADMIN_LAST_NAME=Administrator
```

Then run:

```sh
cd server
npm run seed:admin
```

The command is idempotent for an existing Admin email and refuses to promote an
existing Customer. Remove the `INITIAL_ADMIN_*` values from the environment
after the account is created; they are not needed by the running API.

## Auth API

- `POST /api/auth/register` creates an active Customer and signs them in.
- `POST /api/auth/login` signs in an active Customer or Admin.
- `GET /api/auth/me` restores the authenticated user.
- `POST /api/auth/logout` clears the authentication cookie.

Public registration ignores unknown fields and always assigns the Customer
role. Catalog reads expose active records to the public; catalog mutations,
image uploads, and inventory endpoints require an active Admin.
