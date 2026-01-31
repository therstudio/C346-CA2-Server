# EcoCommute

This project uses an Express.js server running on Node.js.

The server connects to a MySQL database using mysql2 with promise support.  
Environment variables are managed using dotenv for database credentials.

The backend provides RESTful APIs for:

- User management (register, login, update, delete)
- Commute management (create, read, update, delete)
- Image uploads for user avatars and commute records

Multer is used to handle file uploads, and uploaded images are served as static files from the `/uploads` directory.

Each request opens a database connection and safely closes it after completion.

---

## Features

- User registration and login system
- Full CRUD operations for users (create, read, update, delete)
- Password encryption using SHA1
- Upload and update user profile avatars
- Commute tracking per user
- Create, view, edit, and delete commute records
- Each commute stores location, time, distance, purpose, and notes
- Upload images for individual commutes
- User-based data access (users can only view their own commutes)
- RESTful API endpoints
- Environment variable configuration using dotenv

---

## Tech Stack

Backend:
- Node.js
- Express.js

Database:
- MySQL

Libraries:
- mysql2 (promise-based database connection)
- multer (file uploads)
- dotenv (environment variables)

Tools:
- Postman (API testing)
- GitHub (version control)

Storage:
- Local file storage for uploaded images

