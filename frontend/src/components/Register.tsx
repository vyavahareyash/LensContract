import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/register', {
        username: username,
        hashed_password: password, // This is the plain password for registration endpoint
        email: email,
        full_name: fullName,
      });
      setSuccess('Registration successful! You can now log in.');
      // Optionally, navigate to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleRegister} sx={{ mt: 4, mx: 'auto', maxWidth: 400, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
      <TextField
        fullWidth
        label="Email (Optional)"
        type="email"
        variant="outlined"
        value={email}
        onChange={e => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Full Name (Optional)"
        variant="outlined"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Register
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Box>
  );
};
