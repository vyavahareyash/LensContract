import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await api.post('/token', new URLSearchParams({
        username: username,
        password: password,
      }));
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/'); // Redirect to home page on successful login
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ mt: 4, mx: 'auto', maxWidth: 400, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        label="Username"
        variant="outlined"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Login
      </Button>
    </Box>
  );
};
