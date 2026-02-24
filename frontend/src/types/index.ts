export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ExpenseSplit {
  userId: number;
  userName: string;
  amount: number;
}

export interface Expense {
  id: number;
  description: string;
  totalAmount: number;
  createdAt: string;
  payer: User;
  splits: ExpenseSplit[];
}

export interface Balance {
  userId: number;
  userName: string;
  netBalance: number;
}

export interface Settlement {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface Group {
  id: number;
  name: string;
  members?: User[];
}