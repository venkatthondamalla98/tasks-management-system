import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../services/task.service";
 
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, search, page, limit } = req.query;
 
    const data = await getAllTasks({
      userId: req.userId!,
      status: status as string,
      priority: priority as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
 
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Something went wrong" });
  }
};
 
export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await getTaskById(id, req.userId!);
    return res.json(task);
  } catch (err: any) {
    if (err.message === "Task not found") return res.status(404).json({ message: err.message });
    return res.status(500).json({ message: "Something went wrong" });
  }
};
 
export const createTaskHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const task = await createTask(req.userId!, { title, description, status, priority });
    return res.status(201).json(task);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Something went wrong" });
  }
};
 
export const updateTaskHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await updateTask(id, req.userId!, req.body);
    return res.json(task);
  } catch (err: any) {
    if (err.message === "Task not found") return res.status(404).json({ message: err.message });
    return res.status(500).json({ message: "Something went wrong" });
  }
};
 
export const deleteTaskHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await deleteTask(id, req.userId!);
    return res.json({ message: "Task deleted" });
  } catch (err: any) {
    if (err.message === "Task not found") return res.status(404).json({ message: err.message });
    return res.status(500).json({ message: "Something went wrong" });
  }
};
 
export const toggleTaskHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await toggleTask(id, req.userId!);
    return res.json(task);
  } catch (err: any) {
    if (err.message === "Task not found") return res.status(404).json({ message: err.message });
    return res.status(500).json({ message: "Something went wrong" });
  }
};
