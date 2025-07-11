# Environment Setup for Shoes Site

This document explains how to set up the environment variables for the Shoes Site project.

## Setup Instructions

1. **Copy the template file:**
   ```bash
   cp env-template.txt .env
   ```

2. **Edit the `.env` file** with your actual values:

### Database Configuration
- `DB_HOST`: Your MySQL database host (usually `localhost` for local development)
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Your database name (create a database called `shoes_site_db`)

### JWT Configuration
- `JWT_SECRET`: A long, secure random string for JWT token signing
  - You can generate one using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Email Configuration (SMTP)
- `SMTP_HOST`: SMTP server host (e.g., `smtp.gmail.com` for Gmail)
- `SMTP_PORT`: SMTP port (usually `587` for TLS)
- `SMTP_EMAIL`: Your email address
- `SMTP_PASSWORD`: Your email password or app password
- `SMTP_FROM_NAME`: Display name for sent emails
- `SMTP_FROM_EMAIL`: From email address

### Server Configuration
- `PORT`: Port number for the server (default: `3000`)
- `NODE_ENV`: Environment (`development`, `production`, etc.)

## Example .env file:
```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=shoes_site_db

# JWT Configuration
JWT_SECRET=my_super_secret_jwt_key_that_is_very_long_and_secure_123456789

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=myemail@gmail.com
SMTP_PASSWORD=my_app_password_here
SMTP_FROM_NAME=Shoes Site
SMTP_FROM_EMAIL=noreply@shoessite.com

# Environment
NODE_ENV=development
```

## Important Notes

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Keep your JWT_SECRET secure** - it should be a long, random string
3. **For Gmail SMTP**, you'll need to:
   - Enable 2-factor authentication
   - Generate an "App Password" and use that instead of your regular password
4. **Create the database** before running the application:
   ```sql
   CREATE DATABASE shoes_site_db;
   ```

## Troubleshooting

- If you get database connection errors, make sure MySQL is running and the credentials are correct
- If email sending fails, check your SMTP settings and make sure you're using an app password for Gmail
- If JWT authentication fails, make sure your JWT_SECRET is set correctly 