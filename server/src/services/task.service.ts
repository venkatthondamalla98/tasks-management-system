import { prisma } from "../config/prisma";
import { TaskStatus, Priority } from "@prisma/client";

export interface TaskFilters {
  userId: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const toStatusEnum = (s?: string): TaskStatus | undefined => {
  if (!s) return undefined;
  const map: Record<string, TaskStatus> = {
    pending: TaskStatus.PENDING,
    in_progress: TaskStatus.IN_PROGRESS,
    completed: TaskStatus.COMPLETED,
    PENDING: TaskStatus.PENDING,
    IN_PROGRESS: TaskStatus.IN_PROGRESS,
    COMPLETED: TaskStatus.COMPLETED,
  };
  return map[s];
};

const toPriorityEnum = (p?: string): Priority | undefined => {
  if (!p) return undefined;
  const map: Record<string, Priority> = {
    low: Priority.LOW,
    medium: Priority.MEDIUM,
    high: Priority.HIGH,
    LOW: Priority.LOW,
    MEDIUM: Priority.MEDIUM,
    HIGH: Priority.HIGH,
  };
  return map[p];
};

const formatTask = (task: any) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status === "IN_PROGRESS" ? "in_progress" : task.status.toLowerCase(),
  priority: task.priority.toLowerCase(),
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const getAllTasks = async (filters: TaskFilters) => {
  const { userId, status, priority, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  const statusEnum = toStatusEnum(status);
  const priorityEnum = toPriorityEnum(priority);

  if (statusEnum) where.status = statusEnum;
  if (priorityEnum) where.priority = priorityEnum;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks: tasks.map(formatTask),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTaskById = async (id: string, userId: string) => {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new Error("Task not found");
  return formatTask(task);
};

export const createTask = async (
  userId: string,
  data: { title: string; description?: string; status?: string; priority?: string }
) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: toStatusEnum(data.status) ?? TaskStatus.PENDING,
      priority: toPriorityEnum(data.priority) ?? Priority.MEDIUM,
      userId,
    },
  });
  return formatTask(task);
};

export const updateTask = async (
  id: string,
  userId: string,
  data: { title?: string; description?: string; status?: string; priority?: string }
) => {
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: toStatusEnum(data.status) ?? existing.status }),
      ...(data.priority && { priority: toPriorityEnum(data.priority) ?? existing.priority }),
    },
  });
  return formatTask(task);
};

export const deleteTask = async (id: string, userId: string) => {
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Task not found");
  await prisma.task.delete({ where: { id } });
};

export const toggleTask = async (id: string, userId: string) => {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new Error("Task not found");

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    [TaskStatus.PENDING]: TaskStatus.IN_PROGRESS,
    [TaskStatus.IN_PROGRESS]: TaskStatus.COMPLETED,
    [TaskStatus.COMPLETED]: TaskStatus.PENDING,
  };

  const updated = await prisma.task.update({
    where: { id },
    data: { status: nextStatus[task.status] },
  });
  return formatTask(updated);
};