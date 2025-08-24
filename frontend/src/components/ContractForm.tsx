import React, { useState, useEffect } from 'react';
import contractService from '../services/contractService';
import CreatableSelect from 'react-select/creatable';

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
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Contract Name</label>
        <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Tasks</label>
        {tasks.map((task, index) => (
          <div className="row mb-2" key={index}>
            <div className="col">
              <CreatableSelect
                isClearable
                options={taskSuggestions}
                value={{ value: task.name, label: task.name }}
                onChange={selectedOption => handleTaskChange(index, 'name', selectedOption ? selectedOption.value : '')}
                placeholder="Select or type a task"
              />
            </div>
            <div className="col">
              <input type="number" className="form-control" placeholder="Amount" value={task.amount} onChange={e => handleTaskChange(index, 'amount', parseFloat(e.target.value))} required />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-danger" onClick={() => removeTask(index)}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-primary" onClick={addTask}>Add Task</button>
      </div>

      <div className="mb-3">
        <label htmlFor="tags" className="form-label">Tags</label>
        <CreatableSelect
          isMulti
          options={tagSuggestions}
          value={tags.map(tag => ({ value: tag, label: tag }))}
          onChange={selectedOptions => setTags(selectedOptions.map(option => option.value))}
        />
      </div>

      <button type="submit" className="btn btn-success">{contract ? 'Update Contract' : 'Create Contract'}</button>
    </form>
  );
};
