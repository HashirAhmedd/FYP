
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

// routes
import userRouter from "./routes/user.routes.js"
import historicalRouter from "./routes/historical.routes.js"
import dataRouter from "./routes/data.routes.js"
app.use("/api/v1/user", userRouter)
app.use("/api/v1/historical", historicalRouter)
app.use("/api/v1/data", dataRouter)

export default app;
