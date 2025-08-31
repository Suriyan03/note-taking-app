# 📝 Note-Taking Application  

A full-stack note-taking application built with **React, Node.js, and MongoDB**.  
This project was developed as a **technical assignment for the Highway Delite Full Stack Developer internship**.  

---

## 🚀 Live Demo  
- **Frontend:** https://note-taking-app-iota-sage.vercel.app/signup
- **Backend:** https://note-taking-app-kf3o.onrender.com/api

## 💻 Technology Stack  

### Frontend  
- ReactJS (with TypeScript)  
- React Router DOM  
- Axios  

### Backend  
- Node.js (with TypeScript)  
- Express.js  
- Mongoose  
- bcryptjs  
- jsonwebtoken  
- nodemailer  

### Database  
- MongoDB (Hosted on MongoDB Atlas)  

---

## ✨ Features  

This application includes all the functionalities required by the assignment:  

- **User Authentication:** Users can sign up and log in using an email/password flow or an OTP-based flow.  
- **Protected Routes:** A JWT is used to authorize access to user-specific data.  
- **Note Management:** Authenticated users can create, view, and delete their personal notes.  
- **Responsive Design:** The UI is designed to be mobile-friendly.

## 🛠️ Installation and Setup  

Follow these steps to get the project running on your local machine.  

### Prerequisites  
- **Node.js:** v14 or higher  
- **npm:** v6 or higher  
- **MongoDB Atlas:** A free account is required to set up the database

### ⚙️ Backend Setup  

1. Navigate to the backend directory in your terminal.  
2. Install all backend dependencies:  

```bash
npm install
```
3. Create a .env file in the backend directory and add your environment variables:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

4. Run the backend in development mode:
```bash
npm run dev
```
### ⚙️ Frontend Setup 

1. Navigate to the frontend directory in your terminal.
2. Install all frontend dependencies:

```Bash
npm install
```
3. Update the API base URL in src/services/authService.ts to point to your local backend:
``` Bash
baseURL: 'http://localhost:5000/api',
```
4. Run the frontend development server:
``` Bash
npm run dev
```

The application will open in your browser at http://localhost:5173.

---
## API Endpoints 📌

| Method | Endpoint               | Description                                      |
|--------|-----------------------|--------------------------------------------------|
| POST   | `/api/auth/signup`     | Registers a new user with email and password.  |
| POST   | `/api/auth/send-otp`   | Sends an OTP to the user's email for registration. |
| POST   | `/api/auth/verify-otp` | Verifies the OTP and completes user registration. |
| POST   | `/api/auth/login`      | Authenticates a user and returns a JWT.        |
| GET    | `/api/notes`           | Retrieves all notes for the authenticated user. |
| POST   | `/api/notes`           | Creates a new note for the authenticated user. |
| DELETE | `/api/notes/:id`       | Deletes a specific note.                        |


---
