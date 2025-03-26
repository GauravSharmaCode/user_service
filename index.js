import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import 'dotenv/config';

const requiredEnvVars = ['DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const app = express();

app.use(helmet());
app.use(bodyParser.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
      error: "Too many requests, please try again later."
  }
});
app.use(limiter);

const requestLogger = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  req.requestId = Math.random().toString(36).substring(7);
  next();
};

app.use(requestLogger);

app.post("/notify", async (req, res) => {
  const { user_id, message } = req.body;

  // Log incoming request
  console.log({
    timestamp: req.requestTime,
    request_id: req.requestId,
    type: 'REQUEST',
    endpoint: '/notify',
    payload: { user_id, message }
  });

  try {
    // Input validation
    if (!user_id || typeof user_id !== 'number' || !message || typeof message !== 'string') {
      const response = { 
        error: "Invalid input: user_id must be a number and message must be a string"
      };
      console.log({
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
        type: 'RESPONSE',
        status: 400,
        body: response
      });
      return res.status(400).json(response);
    }

    // Message length validation
    if (message.length > 1000) {
      const response = {
        error: "Message too long. Maximum length is 1000 characters"
      };
      console.log({
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
        type: 'RESPONSE',
        status: 400,
        body: response
      });
      return res.status(400).json(response);
    }

    // Log user check
    console.log({
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
      type: 'PROCESS',
      step: 'Checking user existence',
      user_id
    });

    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      const response = { error: "User not found" };
      console.log({
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
        type: 'RESPONSE',
        status: 404,
        body: response
      });
      return res.status(404).json(response);
    }

    // Log notification sending
    console.log({
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
      type: 'PROCESS',
      step: 'Sending notification',
      user_id,
      email: user.email
    });

    const response = { message: "Notification sent" };

    // Log successful response
    console.log({
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
      type: 'RESPONSE',
      status: 200,
      body: response
    });

    return res.json(response);

  } catch (error) {
    // Log error details
    console.error({
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
      type: 'ERROR',
      step: 'Notification processing',
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });

    const response = error instanceof Prisma.PrismaClientKnownRequestError 
      ? { error: "Database operation failed", code: error.code }
      : { error: "Internal server error" };

    console.log({
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
      type: 'RESPONSE',
      status: error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500,
      body: response
    });

    return res.status(error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500)
      .json(response);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

