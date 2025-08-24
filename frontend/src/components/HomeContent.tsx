import React, { useEffect, useState, useCallback } from 'react';
import contractService from '../services/contractService';
import { Box, Grid as MuiGrid, TextField, Card, CardContent, Pagination, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { ContractForm } from './ContractForm';
import { Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Task, Contract } from '../types';

export const HomeContent: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Display 9 contracts per page
  const [totalContracts, setTotalContracts] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string; }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = () => {
    return localStorage.getItem('access_token') !== null;
  };

  const fetchContracts = useCallback(async (page: number, tags: string[] = [], search: string = '') => {
    try {
      const data = await contractService.getContracts(page, itemsPerPage, tags, search);
      setContracts(data.contracts);
      setTotalContracts(data.total_count);
    } catch (error) {
      console.error('There was an error fetching the contracts!', error);
      alert('Failed to fetch contracts. Please try again later.');
    }
  }, [itemsPerPage]);

  const fetchTags = useCallback(async () => {
    try {
      const data = await contractService.getTags();
      setTagOptions(data.map((tag: string) => ({ value: tag, label: tag })));
    } catch (error) {
      console.error('There was an error fetching the tags!', error);
      alert('Failed to fetch tags. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchTags();
    }
  }, [fetchTags]);

  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentPage(1); // Reset page to 1 when filters change
      fetchContracts(1, selectedTags, searchTerm);
    }
  }, [selectedTags, searchTerm, fetchContracts]);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchContracts(currentPage, selectedTags, searchTerm);
    }
  }, [currentPage, selectedTags, searchTerm, fetchContracts]);

  const handleContractCreated = () => {
    fetchContracts(currentPage, selectedTags, searchTerm);
    setShowModal(false);
  };

  const totalPages = Math.ceil(totalContracts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Button variant="contained" onClick={() => setShowModal(true)} sx={{ mb: 2 }}>Create Contract</Button>
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
      <MuiGrid container spacing={2} sx={{ mb: 4 }}>
        <MuiGrid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search by name..."
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </MuiGrid>
        <MuiGrid item xs={12} md={6}>
          <Select
            isMulti
            options={tagOptions}
            onChange={selectedOptions => setSelectedTags(selectedOptions.map(option => option.value))}
            placeholder="Filter by tags..."
          />
        </MuiGrid>
      </MuiGrid>
      <MuiGrid container spacing={2} sx={{ mt: 2 }}>
        {contracts.map(contract => (
          <MuiGrid item xs={12} sm={6} md={4} lg={3} key={contract.id}>
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
          </MuiGrid>
        ))}
      </MuiGrid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, value) => handlePageChange(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};