import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("Tasks management system backend is working 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/test-db", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(PORT, () => console.log(`Server is up and running on ${PORT}`))