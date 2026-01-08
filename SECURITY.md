# Security Considerations

## Implemented Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: Access and refresh tokens with separate secrets and expiration times
3. **Refresh Token Storage**: Refresh tokens are hashed (SHA256 + pepper) before storage
4. **Token Rotation**: Refresh tokens are rotated on each refresh request
5. **Input Validation**: All DTOs are validated using class-validator
6. **SQL Injection Protection**: TypeORM parameterized queries
7. **CORS**: Configured for frontend origin
8. **Sensitive Data**: passwordHash is never exposed in API responses

## Recommended Additional Security Measures

### Rate Limiting
Consider implementing rate limiting for authentication endpoints:
- Use `@nestjs/throttler` package
- Limit login/register attempts (e.g., 5 attempts per 15 minutes)
- Limit refresh token requests

### Environment Variables
- Never commit `.env` files
- Use strong secrets for JWT (minimum 32 characters)
- Rotate secrets regularly in production

### HTTPS
- Always use HTTPS in production
- Configure proper SSL/TLS certificates

### Database Security
- Use connection pooling
- Limit database user permissions
- Regular backups
- Monitor for suspicious queries

### Additional Recommendations
- Implement email verification flow
- Add 2FA (Two-Factor Authentication) for sensitive operations
- Implement account lockout after failed login attempts
- Add request logging and monitoring
- Use helmet.js for additional HTTP headers security

