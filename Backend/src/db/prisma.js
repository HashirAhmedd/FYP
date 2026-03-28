import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;

function getPrisma() {
    if (!prisma) {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

export default new Proxy({}, {
    get: (_, prop) => {
        const client = getPrisma();
        const value = client[prop];
        return typeof value === "function" ? value.bind(client) : value;
    },
});
