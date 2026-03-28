import "dotenv/config"
import app from "./app.js";
import connectDB from "./db/db.js";
import prisma from "./db/prisma.js";

connectDB()
    .then(() => prisma.$connect())
    .then(() => {
        console.log("PostgreSQL connected via Prisma");
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error.message);
    });
