import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SummaryData {
  total_contracts: number;
  total_amount: number;
  contracts_by_tags: { [key: string]: number };
  contracts_by_tasks: { [key: string]: number };
}

export const Summary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/summary')
      .then(response => {
        setSummary(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the summary!', error);
        alert('Failed to fetch summary data. Please try again later.');
      });
  }, []);

  if (!summary) {
    return <div>Loading summary...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Contract Summary</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Contracts</h5>
              <p className="card-text display-4">{summary.total_contracts}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Amount</h5>
              <p className="card-text display-4">₹{summary.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Contracts by Tags</h5>
          <ul className="list-group list-group-flush">
            {Object.entries(summary.contracts_by_tags).map(([tag, count]) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={tag}>
                {tag}
                <span className="badge bg-primary rounded-pill">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Contracts by Tasks</h5>
          <ul className="list-group list-group-flush">
            {Object.entries(summary.contracts_by_tasks).map(([task, count]) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={task}>
                {task}
                <span className="badge bg-primary rounded-pill">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
