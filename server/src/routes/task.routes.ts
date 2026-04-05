import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getTasks,
  getTask,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  toggleTaskHandler,
} from "../controller/task.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.post("/", createTaskHandler);
router.get("/:id", getTask);
router.patch("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);
router.patch("/:id/toggle", toggleTaskHandler);

export default router;