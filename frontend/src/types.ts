export interface Task {
  name: string;
  amount: number;
}

export interface Contract {
  id: string;
  name: string;
  tasks: Task[];
  tags: string[];
  total_amount: number;
}

export interface SummaryData {
  total_contracts: number;
  total_amount: number;
  contracts_by_tags: { [key: string]: number };
  contracts_by_tasks: { [key: string]: number };
}
