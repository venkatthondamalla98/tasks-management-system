'use client';
import { useState } from 'react';
import {
  Card, CardContent, CardActions, Box, Typography, Chip,
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';
import {
  MoreVert, Edit, Delete, CheckCircle, RadioButtonUnchecked, Sync,
} from '@mui/icons-material';
import { Task } from '@/lib/api';
 
const STATUS_MAP: Record<Task['status'], { label: string; color: 'warning' | 'info' | 'success'; icon: React.ReactNode }> = {
  pending:     { label: 'Pending',     color: 'warning', icon: <RadioButtonUnchecked sx={{ fontSize: 13 }} /> },
  in_progress: { label: 'In Progress', color: 'info',    icon: <Sync sx={{ fontSize: 13 }} /> },
  completed:   { label: 'Completed',   color: 'success', icon: <CheckCircle sx={{ fontSize: 13 }} /> },
};
 
const PRIORITY_MAP: Record<Task['priority'], { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: '#10b981', bg: '#ecfdf5' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  high:   { label: 'High',   color: '#ef4444', bg: '#fef2f2' },
};
 
interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}
 
export default function TaskItem({ task, onEdit, onDelete, onToggle }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const status = STATUS_MAP[task.status];
  const priority = PRIORITY_MAP[task.priority];
 
  return (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' },
    }}>
      <CardContent sx={{ flexGrow: 1, pb: 0.5 }}>
        {/* Top row: priority badge + menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip
            label={priority.label} size="small"
            sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 700, fontSize: 11, height: 22, px: 0.5 }}
          />
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ mr: -0.5 }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
 
        {/* Title */}
        <Typography
          variant="subtitle1" fontWeight={700} mb={0.5}
          sx={{
            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
          }}
        >
          {task.title}
        </Typography>
 
        {/* Description */}
        {task.description && (
          <Typography variant="body2" color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
            {task.description}
          </Typography>
        )}
 
        {/* Date */}
        <Typography variant="caption" color="text.disabled" mt={1.5} display="block">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
      </CardContent>
 
      {/* Status chip (clickable to toggle) */}
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Tooltip title="Click to change status">
          <Chip
            icon={status.icon as any}
            label={status.label}
            color={status.color}
            size="small"
            variant="outlined"
            onClick={() => onToggle(task)}
            sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
          />
        </Tooltip>
      </CardActions>
 
      {/* Context menu */}
      <Menu
        anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2.5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 140 } }}
      >
        <MenuItem onClick={() => { onEdit(task); setAnchor(null); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => { onDelete(task); setAnchor(null); }}
          sx={{ color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}
        >
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
 