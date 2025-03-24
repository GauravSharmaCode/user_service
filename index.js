// User Service
// Responsible for receiving notifications about new orders.

// 2. Users Table
// Column Name	Data Type	Description
// user_id	INT (PK)	Unique identifier for each user
// username	VARCHAR	Name of the user
// email	VARCHAR	Email address of the user

// User Service:
// Notify User
// Endpoint: POST /notify

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Main function to demonstrate the usage of the User Service.
 * @returns {Promise<void>}
 */
async function main() {
  // Create a new user
  const user = await prisma.user.create({
    data: {
      name: "Gaurav Sharma",
      email: "gaurav@example.com",
      password: "securepassword123",
    },
  });

  console.log("User created:", user);

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
