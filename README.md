# User Notification Service

A microservice for handling user notifications with PostgreSQL and Express.js.

## Features
- User notification system
- Rate limiting (100 requests/15min)
- Security headers with Helmet
- PostgreSQL with Prisma ORM
- Input validation and error handling

## Prerequisites
- Node.js (v20 or higher)
- PostgreSQL (Neon.tech)
- npm

## Installation

1. Clone and setup:
```bash
git clone https://github.com/gauravsharmacode/user_service.git
cd user_service
npm install
```

2. Environment Configuration:
Create `.env` file:
```properties
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@host/microservicedb?sslmode=require"
```

3. Database Setup:
```bash
npx prisma generate
npx prisma migrate dev
```

## API Endpoints

### Send Notification
```http
POST /notify
Content-Type: application/json

{
    "user_id": 1,
    "message": "Your order has been confirmed!"
}
```

**Success Response (200 OK)**
```json
{
    "message": "Notification sent"
}
```

**Error Responses**
- `400`: Invalid input
- `404`: User not found
- `429`: Rate limit exceeded
- `500`: Server error

## Database Schema

```prisma
model User {
    id        Int      @id @default(autoincrement())
    name      String
    email     String   @unique
    password  String
    createdAt DateTime @default(now())
}
```

## Testing
```bash
node test.js
```

## Running the Service

**Development**
```bash
npm run dev
```

**Production**
```bash
set NODE_ENV=production
npm start
```

## Security Features
- Request rate limiting
- Payload size limits (10kb)
- Helmet security headers
- Input validation
- Environment-based error details

## Dependencies
- express: Web framework
- @prisma/client: Database ORM
- helmet: Security headers
- rate-limiter: Request limiting

## Author
Gaurav Sharma
- GitHub: [@GauravSharmaCode](https://github.com/GauravSharmaCode)
- Email: shrma.gurv@gmail.com

## License
ISC

## Additional Resources
- [Prisma Documentation](https://pris.ly/d/prisma-schema)
- [Express.js Documentation](https://expressjs.com/)
- [Helmet Documentation](https://helmetjs.github.io/)
