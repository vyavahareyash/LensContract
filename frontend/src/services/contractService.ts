import api from './api';

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

interface SummaryData {
  total_contracts: number;
  total_amount: number;
  contracts_by_tags: { [key: string]: number };
  contracts_by_tasks: { [key: string]: number };
}

const contractService = {
  getContracts: async (page: number, itemsPerPage: number, tags: string[] = [], search: string = '') => {
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
    const response = await api.get(`/contracts?${params.toString()}`);
    return response.data;
  },

  getContractById: async (contractId: string) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  createContract: async (contractData: Omit<Contract, 'id' | 'total_amount'>) => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },

  updateContract: async (contractId: string, contractData: Omit<Contract, 'id' | 'total_amount'>) => {
    const response = await api.put(`/contracts/${contractId}`, contractData);
    return response.data;
  },

  deleteContract: async (contractId: string) => {
    const response = await api.delete(`/contracts/${contractId}`);
    return response.data;
  },

  getTasks: async () => {
    const response = await api.get<string[]>('/tasks');
    return response.data;
  },

  getTags: async () => {
    const response = await api.get<string[]>('/tags');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get<SummaryData>('/summary');
    return response.data;
  },
};

export default contractService;
