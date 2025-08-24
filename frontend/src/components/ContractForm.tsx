import React, { useState, useEffect } from 'react';
import contractService from '../services/contractService';
import { TextField, Button, Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CreatableSelect from 'react-select/creatable';
import { SingleValue } from 'react-select';

interface Task {
  name: string;
  amount: number;
}

interface Contract {
  id: string;
  name: string;
  tasks: Task[];
  tags: string[];
}

interface ContractFormProps {
  onContractCreated: () => void;
  contract?: Contract | null;
  showModal: boolean;
}

export const ContractForm: React.FC<ContractFormProps> = ({ onContractCreated, contract, showModal }) => {
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [taskSuggestions, setTaskSuggestions] = useState<{ value: string; label: string; }[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<{ value: string; label: string; }[]>([]);

  useEffect(() => {
    if (showModal) { // Only fetch suggestions when modal is shown
      contractService.getTasks().then(data => {
        setTaskSuggestions(data.map((task: string) => ({ value: task, label: task })));
      }).catch(error => {
        console.error('There was an error fetching task suggestions!', error);
        alert('Failed to fetch task suggestions.');
      });
      contractService.getTags().then(data => {
        setTagSuggestions(data.map((tag: string) => ({ value: tag, label: tag })));
      }).catch(error => {
        console.error('There was an error fetching tag suggestions!', error);
        alert('Failed to fetch tag suggestions.');
      });
    }
  }, [showModal]);

  useEffect(() => {
    if (contract) {
      setName(contract.name);
      setTasks(contract.tasks);
      setTags(contract.tags);
    }
  }, [contract]);

  const handleTaskChange = (index: number, field: keyof Task, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { name: '', amount: 0 }]);
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (tasks.length === 0) {
      alert('Please add at least one task.');
      return;
    }

    for (const task of tasks) {
      if (task.name.trim() === '') {
        alert('Task name cannot be empty.');
        return;
      }
      if (task.amount <= 0) {
        alert('Task amount must be greater than zero.');
        return;
      }
    }

    const contractData = { name, tasks, tags };

    if (contract) {
      contractService.updateContract(contract.id, contractData)
        .then(() => {
          onContractCreated();
        })
        .catch(error => {
          console.error('There was an error updating the contract!', error);
        });
    } else {
      contractService.createContract(contractData)
        .then(() => {
          onContractCreated();
          setName('');
          setTasks([]);
          setTags([]);
        })
        .catch(error => {
          console.error('There was an error creating the contract!', error);
        });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Contract Name"
        variant="outlined"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <Typography variant="h6" gutterBottom>Tasks</Typography>
      {tasks.map((task, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <CreatableSelect
            isClearable
            options={taskSuggestions}
            value={{ value: task.name, label: task.name }}
            onChange={(selectedOption: SingleValue<{ value: string; label: string; }>) => handleTaskChange(index, 'name', selectedOption ? selectedOption.value : '')}
            placeholder="Select or type a task"
            styles={{
              container: (provided: any) => ({ ...provided, flexGrow: 1 }),
            }}
          />
          <TextField
            type="number"
            label="Amount"
            variant="outlined"
            value={task.amount}
            onChange={e => handleTaskChange(index, 'amount', parseFloat(e.target.value))}
            required
            sx={{ width: 120 }}
          />
          <IconButton color="error" onClick={() => removeTask(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" onClick={addTask} sx={{ mb: 3 }}>Add Task</Button>

      <Typography variant="h6" gutterBottom>Tags</Typography>
      <CreatableSelect
        isMulti
        options={tagSuggestions}
        value={tags.map(tag => ({ value: tag, label: tag }))}
        onChange={(selectedOptions: any) => setTags(selectedOptions.map((option: any) => option.value))}
      />

      <Button type="submit" variant="contained" color="primary">
        {contract ? 'Update Contract' : 'Create Contract'}
      </Button>
    </Box>
  );
};
