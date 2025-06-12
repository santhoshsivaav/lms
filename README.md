# Learning Management System (LMS)

A full-featured Learning Management System with a React-based admin panel and a mobile app for students.

## Features

### Student Features (Mobile App)
- User signup/login with JWT authentication
- Browse courses with thumbnails, tags, and skills
- Watch video lessons and access PDF materials
- Track progress with "Continue watching" feature
- Secure video playback with watermark and screen capture protection
- One-time payment subscription to unlock all courses
- Razorpay integration for payments
- Local token storage using expo-secure-store

### Admin Features (Admin Panel)
- Secure admin login with protected routes
- Dashboard overview with key metrics
- Create, edit, and delete courses
- Upload course thumbnails, modules, and lessons
- Manage video and PDF content for each lesson
- View user list and subscription status

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Multer + Cloudinary for file uploads
- Razorpay integration

### Admin Panel
- React
- Material-UI
- React Query
- React Router
- Formik + Yup
- Axios

### Mobile App
- React Native (Expo)
- React Navigation
- Expo Secure Store
- React Native Video

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- Cloudinary account
- Razorpay account

### Environment Variables
Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb+srv://santhoshcursor:Sandyyunus03@lmsyunus.u3i9jfr.mongodb.net/lmsyunus
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Installation

1. Install backend dependencies:
```bash
cd server
npm install
```

2. Install admin panel dependencies:
```bash
cd admin
npm install
```

3. Install mobile app dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the admin panel:
```bash
cd admin
npm start
```

3. Start the mobile app:
```bash
cd client
npm start
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Courses
- GET /api/courses - Get all courses
- GET /api/courses/:id - Get course by ID
- POST /api/courses - Create new course (Admin)
- PUT /api/courses/:id - Update course (Admin)
- DELETE /api/courses/:id - Delete course (Admin)

### Users
- GET /api/users - Get all users (Admin)
- GET /api/users/:id - Get user by ID (Admin)
- PUT /api/users/:id/subscription - Update user subscription (Admin)
- DELETE /api/users/:id - Delete user (Admin)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 