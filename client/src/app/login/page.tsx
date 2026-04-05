'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, TaskAlt } from '@mui/icons-material';
import { authApi } from '@/lib/api';
import { tokenStorage } from '@/lib/auth';
import toast from 'react-hot-toast';
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (!res?.accessToken) throw new Error('Invalid response from server');
      tokenStorage.set(res.accessToken, res.refreshToken);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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
      {/* Decorative blobs */}
      <Box sx={{ position: 'fixed', top: -120, left: -120, width: 450, height: 450,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: -80, right: -80, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none' }} />
 
      <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: 0 }}>
          {/* Logo */}
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
 
          <Typography variant="h4" fontWeight={800} mb={0.5}>Welcome back</Typography>
          <Typography color="text.secondary" mb={3}>Sign in to your account</Typography>
 
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth required autoComplete="email"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>,
              }}
            />
            <TextField
              label="Password" type={showPw ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              fullWidth required autoComplete="current-password"
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
            <Button type="submit" variant="contained" fullWidth size="large"
              disabled={loading} sx={{ py: 1.5, fontSize: '0.95rem', mt: 0.5 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
 
          <Typography align="center" mt={3} color="text.secondary" fontSize={14}>
            Don&apos;t have an account?{' '}
            <MuiLink component={NextLink} href="/register" fontWeight={700} underline="hover" color="primary">
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}