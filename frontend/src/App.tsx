import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Modal, IconButton, Grid, TextField, Card, CardContent, Pagination } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ContractForm } from './components/ContractForm';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ContractDetail } from './components/ContractDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { PrivateRoute } from './components/PrivateRoute';
import { Summary } from './components/Summary';
import { HomeContent } from './components/HomeContent';



function App() {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return localStorage.getItem('access_token') !== null;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>LensContract</Link>
          </Typography>
          {isAuthenticated() ? (
            <>
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="/summary">Summary</Button>
              <Button color="inherit" onClick={() => setShowModal(true)}>Create Contract</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create Contract
            <IconButton
              aria-label="close"
              onClick={() => setShowModal(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
          <ContractForm onContractCreated={() => setShowModal(false)} showModal={showModal} />
        </Box>
      </Modal>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><HomeContent /></PrivateRoute>} />
        <Route path="/contracts/:contractId" element={<PrivateRoute><ContractDetail /></PrivateRoute>} />
        <Route path="/summary" element={<PrivateRoute><Summary /></PrivateRoute>} />
        <Route path="*" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;