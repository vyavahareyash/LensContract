import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contractService from '../services/contractService';
import { Typography, Button, Box, List, ListItem, ListItemText, Chip, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ContractForm } from './ContractForm';

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

export const ContractDetail: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const fetchContract = async () => {
    try {
      const data = await contractService.getContractById(contractId as string);
      setContract(data);
    } catch (error) {
      console.error('There was an error fetching the contract details!', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.deleteContract(contractId as string);
        navigate('/');
      } catch (error) {
        console.error('There was an error deleting the contract!', error);
        alert('Failed to delete contract. Please try again later.');
      }
    }
  };

  const handleContractUpdated = () => {
    fetchContract();
    setShowEditModal(false);
  };

  if (!contract) {
    return <Box sx={{ mt: 4, textAlign: 'center' }}>Loading...</Box>;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">{contract.name}</Typography>
        <Box>
          <Button variant="contained" onClick={() => setShowEditModal(true)} sx={{ mr: 1 }}>Edit</Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>Delete</Button>
        </Box>
      </Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>Total Amount: ₹{contract.total_amount.toFixed(2)}</Typography>
      <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>Tasks</Typography>
      <List>
        {contract.tasks.map((task, index) => (
          <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <ListItemText primary={task.name} />
            <Chip label={`₹${task.amount.toFixed(2)}`} color="primary" />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>Tags</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {contract.tags.map((tag, index) => (
          <Chip key={index} label={tag} color="secondary" />
        ))}
      </Box>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
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
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Edit Contract
            <IconButton
              aria-label="close"
              onClick={() => setShowEditModal(false)}
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
          <ContractForm onContractCreated={handleContractUpdated} contract={contract} showModal={showEditModal} />
        </Box>
      </Modal>
    </Box>
  );
};
