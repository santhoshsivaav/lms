# LMS API Documentation

## Overview
This is the backend API for the Learning Management System (LMS). It provides endpoints for user authentication, course management, video streaming, and analytics.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- FFmpeg (for video processing)

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@example.com
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Courses

#### Get All Courses
```http
GET /api/courses
Authorization: Bearer <token>
```

#### Get Course by ID
```http
GET /api/courses/:id
Authorization: Bearer <token>
```

#### Create Course (Admin Only)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Course Title",
    "description": "Course Description",
    "level": "beginner",
    "price": 99.99
}
```

#### Update Course (Admin Only)
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Updated Title",
    "price": 149.99
}
```

#### Delete Course (Admin Only)
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

### Videos

#### Upload Video (Admin Only)
```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <video_file>
courseId: <course_id>
title: "Video Title"
description: "Video Description"
isPreview: false
```

#### Get Video Stream
```http
GET /api/videos/stream/:id
Authorization: Bearer <token>
```

### Subscriptions

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
    "planId": "plan_id",
    "paymentMethod": "razorpay"
}
```

#### Get Subscription Status
```http
GET /api/subscriptions/status
Authorization: Bearer <token>
```

### Analytics (Admin Only)

#### Get Overall Analytics
```http
GET /api/analytics/overall
Authorization: Bearer <token>
```

#### Get User Growth
```http
GET /api/analytics/users/growth?period=month
Authorization: Bearer <token>
```

#### Get Course Analytics
```http
GET /api/analytics/courses
Authorization: Bearer <token>
```

#### Get Revenue Analytics
```http
GET /api/analytics/revenue?period=month
Authorization: Bearer <token>
```

#### Get Video Engagement
```http
GET /api/analytics/videos/engagement
Authorization: Bearer <token>
```

## Webhooks

### Razorpay Webhook
```http
POST /api/webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: <signature>

{
    "event": "payment.captured",
    "payload": {
        "payment": {
            "id": "pay_id",
            "amount": 1000,
            "currency": "INR"
        },
        "subscription": {
            "id": "sub_id"
        }
    }
}
```

### Subscription Update Webhook
```http
POST /api/webhooks/subscription/update
Content-Type: application/json

{
    "subscriptionId": "sub_id",
    "status": "active"
}
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
    "message": "Error message",
    "errors": [
        {
            "field": "field_name",
            "message": "field error message"
        }
    ]
}
```

## Testing

Run the test suite:
```bash
npm test
```

## Security

- All endpoints except registration and login require JWT authentication
- Admin-only endpoints are protected by role-based middleware
- Video streams are protected and require valid subscription
- Webhook signatures are verified for Razorpay events
- Passwords are hashed using bcrypt
- CORS is enabled for specific origins
- Rate limiting is implemented for all endpoints

## Storage and Media

- Course content and media files are stored in Cloudinary
- Video processing is handled by Cloudinary's video transformation API
- Images are optimized and transformed for different devices
- MongoDB is used for all data storage and caching

## Video Processing

- Videos are processed using Cloudinary's video transformation API
- Watermarking is applied to all videos
- Adaptive bitrate streaming is supported
- Preview videos are available without subscription

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 





If you are using Expo, you’ll need to eject to the bare workflow or use a webview workaround, as Razorpay’s official SDK is not supported in Expo Go.