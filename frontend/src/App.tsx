import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
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

  const fetchContracts = (page: number, tags: string[] = [], search: string = '') => {
    const skip = (page - 1) * itemsPerPage;
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', itemsPerPage.toString());
    if (tags.length > 0) {
      params.append('tags', tags.join(','));
    }
    if (search) {
      params.append('search', search);
    }

    axios.get(`http://127.0.0.1:8000/contracts?${params.toString()}`)
      .then(response => {
        setContracts(response.data.contracts);
        setTotalContracts(response.data.total_count);
      })
      .catch(error => {
        console.error('There was an error fetching the contracts!', error);
        alert('Failed to fetch contracts. Please try again later.');
      });
  };

  const fetchTags = () => {
    axios.get('http://127.0.0.1:8000/tags')
      .then(response => {
        setTagOptions(response.data.map((tag: string) => ({ value: tag, label: tag })));
      })
      .catch(error => {
        console.error('There was an error fetching the tags!', error);
        alert('Failed to fetch tags. Please try again later.');
      });
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">LensContract</Link>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/summary">Summary</Link>
            </li>
          </ul>
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
            <div className="row mb-4">
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-md-6">
                <Select
                  isMulti
                  options={tagOptions}
                  onChange={selectedOptions => setSelectedTags(selectedOptions.map(option => option.value))}
                  placeholder="Filter by tags..."
                />
              </div>
            </div>
            <div className="row">
              {contracts.map(contract => (
                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={contract.id}>
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
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </div>
  );
}

export default App;