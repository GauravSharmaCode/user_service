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

app.post("/notify", async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || typeof user_id !== 'number' || !message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Invalid input: user_id must be a number and message must be a string"
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: "Message too long. Maximum length is 1000 characters"
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: user_id
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (process.env.NODE_ENV === 'development') {
      console.info(`Sending notification to ${user.email}: ${message}`);
    }

    return res.json({ message: "Notification sent" });
  } catch (error) {
    console.error('Error processing notification:', {
      error_name: error.name,
      error_message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ 
        error: "Database operation failed",
        code: error.code
      });
    }

    return res.status(500).json({ 
      error: "Internal server error",
      request_id: req.id 
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

