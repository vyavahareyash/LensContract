import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, List, ListItem, ListItemText, Chip } from '@mui/material';
import contractService from '../services/contractService';

interface SummaryData {
  total_contracts: number;
  total_amount: number;
  contracts_by_tags: { [key: string]: number };
  contracts_by_tasks: { [key: string]: number };
}

export const Summary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await contractService.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('There was an error fetching the summary!', error);
        alert('Failed to fetch summary data. Please try again later.');
      }
    };
    fetchSummary();
  }, []);

  if (!summary) {
    return <Box sx={{ mt: 4, textAlign: 'center' }}>Loading summary...</Box>;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Typography variant="h4" component="h1" gutterBottom>Contract Summary</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div">Total Contracts</Typography>
              <Typography variant="h3" color="primary">{summary.total_contracts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div">Total Amount</Typography>
              <Typography variant="h3" color="primary">₹{summary.total_amount.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>Contracts by Tags</Typography>
          <List>
            {Object.entries(summary.contracts_by_tags).map(([tag, count]) => (
              <ListItem key={tag} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <ListItemText primary={tag} />
                <Chip label={count} color="primary" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>Contracts by Tasks</Typography>
          <List>
            {Object.entries(summary.contracts_by_tasks).map(([task, count]) => (
              <ListItem key={task} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <ListItemText primary={task} />
                <Chip label={count} color="primary" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
