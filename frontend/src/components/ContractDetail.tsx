import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  const fetchContract = () => {
    axios.get(`http://127.0.0.1:8000/contracts/${contractId}`)
      .then(response => {
        setContract(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the contract details!', error);
      });
  };

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      axios.delete(`http://127.0.0.1:8000/contracts/${contractId}`)
        .then(() => {
          navigate('/');
        })
        .catch(error => {
          console.error('There was an error deleting the contract!', error);
          alert('Failed to delete contract. Please try again later.');
        });
    }
  };

  const handleContractUpdated = () => {
    fetchContract();
    setShowEditModal(false);
  };

  if (!contract) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1>{contract.name}</h1>
        <div>
          <button className="btn btn-primary me-2" onClick={() => setShowEditModal(true)}>Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      <h3>Total Amount: ${contract.total_amount.toFixed(2)}</h3>
      <hr />
      <h4>Tasks</h4>
      <ul className="list-group">
        {contract.tasks.map((task, index) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
            {task.name}
            <span className="badge bg-primary rounded-pill">₹{task.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <hr />
      <h4>Tags</h4>
      <div>
        {contract.tags.map((tag, index) => (
          <span className="badge bg-secondary me-2" key={index}>{tag}</span>
        ))}
      </div>

      {/* Modal for editing contract */}
      <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: showEditModal ? 'rgba(0,0,0,0.5)' : '' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Contract</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="modal-body">
              <ContractForm onContractCreated={handleContractUpdated} contract={contract} showModal={showEditModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
