import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { ContractForm } from './components/ContractForm';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ContractDetail } from './components/ContractDetail';

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
  const location = useLocation();

  const fetchContracts = (page: number) => {
    const skip = (page - 1) * itemsPerPage;
    axios.get(`http://127.0.0.1:8000/contracts?skip=${skip}&limit=${itemsPerPage}`)
      .then(response => {
        setContracts(response.data.contracts);
        setTotalContracts(response.data.total_count);
      })
      .catch(error => {
        console.error('There was an error fetching the contracts!', error);
        alert('Failed to fetch contracts. Please try again later.');
      });
  };

  useEffect(() => {
    fetchContracts(currentPage);
  }, [currentPage, location]);

  const handleContractCreated = () => {
    fetchContracts(currentPage);
    setShowModal(false);
  };

  const totalPages = Math.ceil(totalContracts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">LensContract</Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Contract</button>
        </div>
      </nav>

      {/* Modal for creating contract */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Contract</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <ContractForm onContractCreated={handleContractCreated} showModal={showModal} />
            </div>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <div className="container mt-4">
            <div className="row">
              {contracts.map(contract => (
                <div className="col-md-4 mb-4" key={contract.id}>
                  <Link to={`/contracts/${contract.id}`} className="card-link">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{contract.name}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">Total Amount: ${contract.total_amount.toFixed(2)}</h6>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <nav aria-label="Page navigation example">
              <p className="text-center">Showing contracts {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalContracts)} of {totalContracts}</p>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        } />
        <Route path="/contracts/:contractId" element={<ContractDetail />} />
      </Routes>
    </div>
  );
}

export default App;
