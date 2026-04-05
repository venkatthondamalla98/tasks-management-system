'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Grid, TextField, MenuItem,
  InputAdornment, IconButton, Skeleton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip, AppBar, Toolbar, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Add, Search, Clear, FilterAlt, TaskAlt, Logout, Dashboard,
  Menu as MenuIcon, Close, WarningAmber,
} from '@mui/icons-material';
import { authApi, tasksApi, Task, TaskPayload } from '@/lib/api';
import { tokenStorage } from '@/lib/auth';
import TaskItem from '@/components/TaskItem';
import toast from 'react-hot-toast';
 
const DRAWER_WIDTH = 240;
 
// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ tasks }: { tasks: Task[] }) {
  const stats = [
    { label: 'Total',       value: tasks.length,                                    color: '#6366f1', bg: '#eef2ff' },
    { label: 'Pending',     value: tasks.filter(t => t.status === 'pending').length,     color: '#f59e0b', bg: '#fffbeb' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Completed',   value: tasks.filter(t => t.status === 'completed').length,   color: '#10b981', bg: '#ecfdf5' },
  ];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, mb: 3 }}>
      {stats.map((s) => (
        <Box key={s.label} sx={{ p: 2.5, borderRadius: 3, bgcolor: s.bg, border: '1px solid', borderColor: s.bg }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
          <Typography variant="body2" fontWeight={600} color="text.secondary" mt={0.5}>{s.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
 
// ─── Task Form Dialog ─────────────────────────────────────────────────────────
interface FormDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (payload: TaskPayload) => Promise<void>;
}
function TaskFormDialog({ open, task, onClose, onSave }: FormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  useEffect(() => {
    if (open) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || 'pending');
      setPriority(task?.priority || 'medium');
      setError('');
    }
  }, [open, task]);
 
  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), status, priority });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography fontWeight={700} variant="h6">{task ? 'Edit Task' : 'New Task'}</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            fullWidth required autoFocus error={!!error} helperText={error}
          />
          <TextField
            label="Description (optional)" value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth multiline rows={3}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Status" value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])} fullWidth>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField select label="Priority" value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])} fullWidth>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ minWidth: 120 }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : task ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ open, taskTitle, onClose, onConfirm }: {
  open: boolean; taskTitle: string; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WarningAmber sx={{ color: 'error.main', fontSize: 26 }} />
        Delete Task
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          Delete <strong>&quot;{taskTitle}&quot;</strong>? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={() => { onConfirm(); onClose(); }} variant="contained" color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
 
// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
 
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
 
  // filters
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [priorityFilter, setPriority] = useState('');
 
  // dialogs
  const [formOpen, setFormOpen]   = useState(false);
  const [editTask, setEditTask]   = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
 
  // Auth guard — runs after client mount (localStorage available)
  useEffect(() => {
    const token = tokenStorage.getAccess();
    console.log('[Auth Guard] token found:', !!token);
    if (!token) {
      router.replace('/login');
    } else {
      setAuthReady(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  const user = tokenStorage.getUser();
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
 
  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res: any = await tasksApi.getAll(params);
      const data = res.data ?? res;
      setTasks(Array.isArray(data) ? data : data.tasks ?? []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);
 
  useEffect(() => { if (authReady) fetchTasks(); }, [fetchTasks, authReady]);
 
  // CRUD handlers
  const handleSave = async (payload: TaskPayload) => {
    if (editTask) {
      const res: any = await tasksApi.update(editTask.id, payload);
      const updated = res.data ?? res;
      setTasks((prev) => prev.map((t) => (t.id === editTask.id ? updated : t)));
      toast.success('Task updated!');
    } else {
      const res: any = await tasksApi.create(payload);
      const created = res.data ?? res;
      setTasks((prev) => [created, ...prev]);
      toast.success('Task created!');
    }
    setEditTask(null);
  };
 
  const handleDelete = async () => {
    if (!deleteTask) return;
    await tasksApi.delete(deleteTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== deleteTask.id));
    toast.success('Task deleted!');
    setDeleteTask(null);
  };
 
  const handleToggle = async (task: Task) => {
    const next: Record<Task['status'], Task['status']> = {
      pending: 'in_progress', in_progress: 'completed', completed: 'pending',
    };
    const res: any = await tasksApi.toggle(task.id);
    const updated = res.data ?? res;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    toast.success(`Status → ${next[task.status].replace('_', ' ')}`);
  };
 
  const handleLogout = async () => {
    try {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore logout API errors
    } finally {
      tokenStorage.clear();
      toast.success('Logged out successfully');
      router.replace('/login');
    }
  };
 
  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); };
  const hasFilters = search || statusFilter || priorityFilter;
 
  // Show spinner until auth is confirmed
  if (!authReady) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }
 
  // ─── Sidebar Content ─────────────────────────────────────────────────────
  const SidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2,
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TaskAlt sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography fontWeight={800} fontSize={17}>TaskFlow</Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto' }} size="small">
            <Close />
          </IconButton>
        )}
      </Box>
 
      {/* Nav */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2.5, bgcolor: 'primary.main', color: 'white',
            '& .MuiListItemIcon-root': { color: 'white' },
            '&:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemIcon sx={{ minWidth: 36 }}><Dashboard /></ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
 
      <Divider sx={{ mx: 2, mb: 2 }} />
 
      {/* User */}
      <Box sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 0.5,
          bgcolor: '#f1f5f9', borderRadius: 2.5, p: 1.5 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography fontSize={13} fontWeight={700} color="white">{initials}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={600} noWrap fontSize={13}>{user?.name || user?.email}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
          </Box>
        </Box>
        <ListItemButton onClick={handleLogout}
          sx={{ borderRadius: 2.5, color: 'error.main', px: 1.5, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}><Logout fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
 
  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {SidebarContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box',
              border: 'none', boxShadow: '1px 0 16px rgba(0,0,0,0.06)' } }}>
          {SidebarContent}
        </Drawer>
      )}
 
      {/* Main */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <AppBar position="fixed" elevation={0} sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(248,250,252,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
        }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography color="text.secondary" fontWeight={500} fontSize={14}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Toolbar>
        </AppBar>
 
        {/* Content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: { xs: '56px', sm: '64px' } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>My Tasks</Typography>
              <Typography color="text.secondary" mt={0.5} fontSize={14}>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} size="large"
              onClick={() => { setEditTask(null); setFormOpen(true); }}>
              New Task
            </Button>
          </Box>
 
          {/* Stats */}
          <StatsBar tasks={tasks} />
 
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search tasks..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small" sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}><Clear sx={{ fontSize: 16 }} /></IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <TextField select label="Status" value={statusFilter}
              onChange={(e) => setStatus(e.target.value)} size="small" sx={{ minWidth: 140 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><FilterAlt sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField select label="Priority" value={priorityFilter}
              onChange={(e) => setPriority(e.target.value)} size="small" sx={{ minWidth: 130 }}>
              <MenuItem value="">All Priority</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            {hasFilters && (
              <Tooltip title="Clear filters">
                <IconButton onClick={clearFilters} size="small"
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Clear fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
 
          {/* Task Grid */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                  <Skeleton variant="rounded" height={170} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </Typography>
              <Typography color="text.secondary" mt={1} fontSize={14}>
                {hasFilters ? 'Try adjusting your search or filters' : 'Click "New Task" to get started'}
              </Typography>
              {!hasFilters && (
                <Button variant="contained" startIcon={<Add />}
                  onClick={() => { setEditTask(null); setFormOpen(true); }} sx={{ mt: 3 }}>
                  New Task
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={task.id}>
                  <TaskItem
                    task={task}
                    onEdit={(t) => { setEditTask(t); setFormOpen(true); }}
                    onDelete={(t) => setDeleteTask(t)}
                    onToggle={handleToggle}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
 
      {/* Dialogs */}
      <TaskFormDialog
        open={formOpen} task={editTask}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSave={handleSave}
      />
      <DeleteDialog
        open={!!deleteTask}
        taskTitle={deleteTask?.title || ''}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}