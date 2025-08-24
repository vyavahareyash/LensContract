import React, { useEffect, useState } from 'react';
import contractService from './services/contractService';
import { AppBar, Toolbar, Typography, Button, Box, Modal, IconButton, Grid, TextField, Card, CardContent, Pagination } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ContractForm } from './components/ContractForm';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ContractDetail } from './components/ContractDetail';
import Select from 'react-select';
import { Summary } from './components/Summary';

interface Task {
  name: string;
  amount: number;
}

interface Contract {
  id: string;
  name: string;
  tasks: Task[];
  tags: string[];
  total_amount: number;
}

function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Display 9 contracts per page
  const [totalContracts, setTotalContracts] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string; }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const fetchContracts = async (page: number, tags: string[] = [], search: string = '') => {
    try {
      const data = await contractService.getContracts(page, itemsPerPage, tags, search);
      setContracts(data.contracts);
      setTotalContracts(data.total_count);
    } catch (error) {
      console.error('There was an error fetching the contracts!', error);
      alert('Failed to fetch contracts. Please try again later.');
    }
  };

  const fetchTags = async () => {
    try {
      const data = await contractService.getTags();
      setTagOptions(data.map((tag: string) => ({ value: tag, label: tag })));
    } catch (error) {
      console.error('There was an error fetching the tags!', error);
      alert('Failed to fetch tags. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []); // Fetch tags only once on mount

  useEffect(() => {
    setCurrentPage(1); // Reset page to 1 when filters change
    fetchContracts(1, selectedTags, searchTerm);
  }, [selectedTags, searchTerm]);

  useEffect(() => {
    fetchContracts(currentPage, selectedTags, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    // This useEffect is for when navigating back to home page
    // It will re-fetch contracts based on current filters
    if (location.pathname === '/') {
      fetchContracts(currentPage, selectedTags, searchTerm);
    }
  }, [location.pathname]);

  const handleContractCreated = () => {
    fetchContracts(currentPage, selectedTags, searchTerm);
    setShowModal(false);
  };

  const totalPages = Math.ceil(totalContracts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>LensContract</Link>
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/summary">Summary</Button>
          <Button color="inherit" onClick={() => setShowModal(true)}>Create Contract</Button>
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
          <ContractForm onContractCreated={handleContractCreated} showModal={showModal} />
        </Box>
      </Modal>

      <Routes>
        <Route path="/" element={
          <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search by name..."
                variant="outlined"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                isMulti
                options={tagOptions}
                onChange={selectedOptions => setSelectedTags(selectedOptions.map(option => option.value))}
                placeholder="Filter by tags..."
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {contracts.map(contract => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={contract.id}>
                <Link to={`/contracts/${contract.id}`} style={{ textDecoration: 'none' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {contract.name}
                      </Typography>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Total Amount: ₹{contract.total_amount.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => handlePageChange(value)}
              color="primary"
            />
          </Box>
          </Box>
        } />
        <Route path="/contracts/:contractId" element={<ContractDetail />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </div>
  );
}

export default App;