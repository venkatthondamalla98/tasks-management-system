'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, TaskAlt } from '@mui/icons-material';
import { authApi } from '@/lib/api';
import { tokenStorage } from '@/lib/auth';
import toast from 'react-hot-toast';
 
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill all fields'); return; }
    if (password !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password min 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      if (!res?.accessToken) throw new Error('Invalid response from server');
      tokenStorage.set(res.accessToken, res.refreshToken);
      toast.success('Account created!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', p: 2,
      background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #fef3c7 100%)',
    }}>
      <Box sx={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none' }} />
 
      <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TaskAlt sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1}>TaskFlow</Typography>
              <Typography variant="caption" color="text.secondary">Task Management</Typography>
            </Box>
          </Box>
 
          <Typography variant="h4" fontWeight={800} mb={0.5}>Create account</Typography>
          <Typography color="text.secondary" mb={3}>Get started with TaskFlow</Typography>
 
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)}
              fullWidth required
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField label="Email address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} fullWidth required
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField
              label="Password" type={showPw ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              fullWidth required helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm password" type={showPw ? 'text' : 'password'}
              value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} fullWidth required
              error={!!confirmPw && password !== confirmPw}
              helperText={confirmPw && password !== confirmPw ? 'Passwords do not match' : ''}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
            />
            <Button type="submit" variant="contained" fullWidth size="large"
              disabled={loading} sx={{ py: 1.5, fontSize: '0.95rem', mt: 0.5 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>
 
          <Typography align="center" mt={3} color="text.secondary" fontSize={14}>
            Already have an account?{' '}
            <MuiLink component={NextLink} href="/login" fontWeight={700} underline="hover" color="primary">
              Sign in
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}