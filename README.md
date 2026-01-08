# Auth API

Production-ready NestJS authentication API with TypeORM and PostgreSQL.

## Features

- **Local Authentication**: Registration and login with email + password
- **Google OAuth2**: Authentication via Google with account linking
- **JWT Tokens**: Access token + refresh token with separate secrets and expiration
- **Secure Token Storage**: Refresh tokens hashed with SHA256 + pepper
- **Token Rotation**: Refresh tokens rotated on each refresh request
- **Input Validation**: All DTOs validated with class-validator
- **TypeORM**: PostgreSQL integration with migrations support
- **Clean Architecture**: Clear separation of concerns (DTOs, entities, services, controllers, strategies, guards, decorators)

## Tech Stack

- NestJS (latest)
- TypeORM
- PostgreSQL
- Passport (JWT + Google OAuth20)
- bcrypt (password hashing)
- class-validator / class-transformer

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- Yarn

## Installation

```bash
yarn install
```

## Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=auth_db

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Mail (Email Verification)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@yourapp.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE auth_db;
```

2. Run migrations (when available):
```bash
yarn typeorm migration:run
```

## Running the Application

```bash
# development
yarn start:dev

# production
yarn build
yarn start:prod
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
  - Body: `{ email: string, password: string }`
  - Returns: `{ accessToken, refreshToken, user }`

- `POST /auth/login` - Login user
  - Body: `{ email: string, password: string }`
  - Returns: `{ accessToken, refreshToken, user }`

- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken: string }`
  - Returns: `{ accessToken, refreshToken, user }`

- `POST /auth/logout` - Logout user
  - Body: `{ refreshToken: string }`
  - Returns: `{ message: string }`

- `GET /auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer <accessToken>`
  - Returns: `{ id, email, provider, googleId, isEmailVerified }`

### Google OAuth

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback (handles login/linking/registration)

### Email Verification

- `POST /auth/verify-email` - Verify email with code
  - Body: `{ userId: string, code: string }`
  - Returns: `{ message: string }`

- `POST /auth/resend-verification` - Resend verification code
  - Body: `{ userId: string }`
  - Returns: `{ message: string }`

## Project Structure

```
src/
├── config/           # Configuration and environment validation
├── database/         # TypeORM configuration
├── common/           # Shared utilities, filters, guards, decorators
└── modules/
    ├── auth/         # Authentication module
    │   ├── controllers/
    │   ├── services/
    │   ├── dto/
    │   ├── entities/
    │   ├── strategies/
    │   ├── guards/
    │   └── decorators/
    └── users/         # Users module
        ├── services/
        ├── dto/
        └── entities/
```

## Security

See [SECURITY.md](./SECURITY.md) for security considerations and recommendations.

## Testing

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov
```

## License

MIT
