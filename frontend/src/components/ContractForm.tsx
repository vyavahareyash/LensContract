import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import contractService from '../services/contractService';
import { TextField, Button, Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CreatableSelect from 'react-select/creatable';
import { SingleValue } from 'react-select';
import { Task, Contract } from '../types';

interface ContractFormProps {
  onContractCreated: () => void;
  contract?: Contract | null;
  showModal: boolean;
}

interface FormData {
  name: string;
  tasks: Task[];
  tags: string[];
}

export const ContractForm: React.FC<ContractFormProps> = ({ onContractCreated, contract, showModal }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      tasks: [],
      tags: [],
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

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
      reset({
        name: contract.name,
        tasks: contract.tasks,
        tags: contract.tags,
      });
    } else {
      reset({
        name: '',
        tasks: [],
        tags: [],
      });
    }
  }, [contract, showModal, reset]);

  const onSubmit = async (data: FormData) => {
    if (data.tasks.length === 0) {
      alert('Please add at least one task.');
      return;
    }

    for (const task of data.tasks) {
      if (task.name.trim() === '') {
        alert('Task name cannot be empty.');
        return;
      }
      if (task.amount <= 0) {
        alert('Task amount must be greater than zero.');
        return;
      }
    }

    if (contract) {
      contractService.updateContract(contract.id, data)
        .then(() => {
          onContractCreated();
        })
        .catch(error => {
          console.error('There was an error updating the contract!', error);
        });
    } else {
      contractService.createContract(data)
        .then(() => {
          onContractCreated();
          reset();
        })
        .catch(error => {
          console.error('There was an error creating the contract!', error);
        });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Contract Name"
        variant="outlined"
        {...register("name", { required: "Contract Name is required" })}
        error={!!errors.name}
        helperText={errors.name?.message}
        sx={{ mb: 2 }}
      />

      <Typography variant="h6" gutterBottom>Tasks</Typography>
      {fields.map((field, index) => (
        <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Controller
            name={`tasks.${index}.name`}
            control={control}
            rules={{ required: "Task name is required" }}
            render={({ field: controllerField }) => (
              <CreatableSelect
                {...controllerField}
                isClearable
                options={taskSuggestions}
                value={taskSuggestions.find(option => option.value === controllerField.value) || null}
                onChange={(selectedOption: SingleValue<{ value: string; label: string; }>) => controllerField.onChange(selectedOption ? selectedOption.value : '')}
                placeholder="Select or type a task"
                styles={{
                  container: (provided: any) => ({ ...provided, flexGrow: 1 }),
                }}
              />
            )}
          />
          <Controller
            name={`tasks.${index}.amount`}
            control={control}
            rules={{ required: "Amount is required", min: { value: 0.01, message: "Amount must be greater than zero" } }}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                type="number"
                label="Amount"
                variant="outlined"
                onChange={e => controllerField.onChange(parseFloat(e.target.value))}
                error={!!errors.tasks?.[index]?.amount}
                helperText={errors.tasks?.[index]?.amount?.message}
                sx={{ width: 120 }}
              />
            )}
          />
          <IconButton color="error" onClick={() => remove(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" onClick={() => append({ name: '', amount: 0 })} sx={{ mb: 3 }}>Add Task</Button>

      <Typography variant="h6" gutterBottom>Tags</Typography>
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <CreatableSelect
            {...field}
            isMulti
            options={tagSuggestions}
            value={tagSuggestions.filter(option => field.value.includes(option.value))}
            onChange={(selectedOptions: any) => field.onChange(selectedOptions ? selectedOptions.map((option: any) => option.value) : [])}
          />
        )}
      />

      <Button type="submit" variant="contained" color="primary">
        {contract ? 'Update Contract' : 'Create Contract'}
      </Button>
    </Box>
  );
};
