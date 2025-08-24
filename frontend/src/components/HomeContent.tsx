import React, { useEffect, useState } from 'react';
import contractService from '../services/contractService';
import { Box, Grid, TextField, Card, CardContent, Pagination, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Select from 'react-select';

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

export const HomeContent: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Display 9 contracts per page
  const [totalContracts, setTotalContracts] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string; }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      setTagOptions(response.data.map((tag: string) => ({ value: tag, label: tag })));
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

  const totalPages = Math.ceil(totalContracts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
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
  );
};
