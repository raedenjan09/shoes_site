# Shoes Site Setup Guide

This guide will help you get the shoes site application running locally.

## Prerequisites

- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

1. **Create the database:**
   ```bash
   mysql -u root -p < database-schema.sql
   ```

2. **Test database connection:**
   ```bash
   node test-connection.js
   ```

## Step 3: Configure Environment Variables

1. **Create your .env file:**
   ```bash
   cp env-template.txt .env
   ```

2. **Edit the .env file with your actual values:**
   ```env
   # Server Configuration
   PORT=3000

   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=shoes_site_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here

   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM_NAME=Shoes Site
   SMTP_FROM_EMAIL=noreply@shoessite.com

   # Environment
   NODE_ENV=development
   ```

## Step 4: Start the Application

```bash
npm start
```

The application should now be running on `http://localhost:3000`

## Step 5: Test the Application

1. **Open your browser** and go to `http://localhost:3000`
2. **You should see the home page** with sample shoe products
3. **Click on "Login"** to test the login functionality
4. **Use the sample credentials:**
   - Email: `john@example.com`
   - Password: (you'll need to create a real password in the database)

## Troubleshooting

### "Cannot GET /api/v1/login" Error

This error occurs when:
1. The server isn't running
2. You're trying to access the API directly instead of the HTML page
3. The routes aren't properly configured

**Solution:**
- Make sure the server is running (`npm start`)
- Access the login page at `http://localhost:3000/login` (not `/api/v1/login`)
- The API endpoints are for AJAX calls from the frontend

### Database Connection Issues

**Error: "ER_ACCESS_DENIED_ERROR"**
- Check your MySQL username and password in `.env`
- Make sure the user has access to the database

**Error: "ECONNREFUSED"**
- Make sure MySQL is running
- Check if the port (3306) is correct

### Port Already in Use

If you get "EADDRINUSE" error:
- Change the PORT in your `.env` file to another port (e.g., 3001)
- Or kill the process using the current port

## File Structure

```
shoes_site/
├── app.js                 # Main Express application
├── index.js              # Server entry point
├── database-schema.sql   # Database setup script
├── .env                  # Environment variables (create this)
├── routes/               # API route definitions
├── controllers/          # Business logic
├── middlewares/          # Authentication middleware
├── config/               # Database configuration
├── utils/                # Utility functions
├── js/                   # Frontend JavaScript
├── css/                  # Frontend styles
├── images/               # Product images
└── *.html               # Frontend pages
```

## API Endpoints

- `GET /` - Home page
- `GET /login` - Login page
- `GET /register` - Register page
- `GET /profile` - Profile page
- `GET /dashboard` - Admin dashboard
- `GET /item` - Items management page
- `GET /cart` - Shopping cart page

- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User login
- `POST /api/v1/update-profile` - Update user profile
- `DELETE /api/v1/deactivate` - Deactivate user

- `GET /api/v1/items` - Get all items
- `POST /api/v1/items` - Create new item
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item

- `POST /api/v1/create-order` - Create new order

## Sample Data

The database comes with sample data:
- 3 users (john@example.com, jane@example.com, admin@shoessite.com)
- 6 shoe products
- Sample orders

## Next Steps

1. **Create a real user account** by registering
2. **Add your own products** through the admin interface
3. **Test the shopping cart** functionality
4. **Configure email settings** for order notifications

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your database connection
3. Make sure all environment variables are set correctly
4. Check that all dependencies are installed 