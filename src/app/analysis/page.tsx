'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import styles from './page.module.scss';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
}

const AnalysisPage = () => {
  const { user, isLoading } = useAuth0();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let allTransactions: Transaction[] = [];

      // Fetch credit transactions
      const creditQuery = query(
        collection(db, 'creditTransactions'),
        where('userId', '==', user.sub)
      );
      const creditSnapshot = await getDocs(creditQuery);
      const creditTransactions = creditSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        type: 'credit' as const
      }));
      allTransactions = [...allTransactions, ...creditTransactions];

      // Fetch debit transactions
      const debitQuery = query(
        collection(db, 'debitTransactions'),
        where('userId', '==', user.sub)
      );
      const debitSnapshot = await getDocs(debitQuery);
      const debitTransactions = debitSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        type: 'debit' as const
      }));
      allTransactions = [...allTransactions, ...debitTransactions];

      setTransactions(allTransactions);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchTransactions();
    }
  }, [user, isLoading]);

  // Calculate statistics
  const calculateStats = () => {
    const filteredTransactions = dateRange
      ? transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= dateRange[0] && transactionDate <= dateRange[1];
        })
      : transactions;

    const creditTransactions = filteredTransactions.filter(t => t.type === 'credit');
    const debitTransactions = filteredTransactions.filter(t => t.type === 'debit');

    const maxCredit = Math.max(...creditTransactions.map(t => t.amount), 0);
    const maxDebit = Math.max(...debitTransactions.map(t => t.amount), 0);

    const totalCredit = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      maxCredit,
      maxDebit,
      totalCredit,
      totalDebit,
      creditTransactions,
      debitTransactions
    };
  };

  // Prepare data for pie chart
  const getPieChartData = () => {
    const { totalCredit, totalDebit } = calculateStats();
    return [
      { name: 'Credit', value: totalCredit },
      { name: 'Debit', value: totalDebit }
    ];
  };

  // Get transactions for selected date
  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.messageCard}>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your analysis.</p>
        </div>
      </div>
    );
  }

  const { maxCredit, maxDebit } = calculateStats();
  const pieChartData = getPieChartData();
  const selectedDateTransactions = getTransactionsForDate(selectedDate);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Financial Analysis</h1>

        {/* Date Range Selector */}
        <div className={styles.section}>
          <h2>Select Date Range</h2>
          <div className={styles.dateRangeSelector}>
            <button onClick={() => setDateRange(null)}>All Time</button>
            <button onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 5);
              setDateRange([start, end]);
            }}>Last 5 Days</button>
            <button onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 7);
              setDateRange([start, end]);
            }}>Last 7 Days</button>
            <button onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 10);
              setDateRange([start, end]);
            }}>Last 10 Days</button>
          </div>
        </div>

        {/* Max Transactions */}
        <div className={styles.section}>
          <h2>Maximum Transactions</h2>
          <div className={styles.maxTransactions}>
            <div className={styles.maxCard}>
              <h3>Maximum Credit</h3>
              <p className={styles.amount}>{formatCurrency(maxCredit)}</p>
            </div>
            <div className={styles.maxCard}>
              <h3>Maximum Debit</h3>
              <p className={styles.amount}>{formatCurrency(maxDebit)}</p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={styles.section}>
          <h2>Transaction Distribution</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar View */}
        <div className={styles.section}>
          <h2>Daily Transactions</h2>
          <div className={styles.calendarContainer}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={({ date }) => {
                const dayTransactions = getTransactionsForDate(date);
                const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
                return total > 0 ? (
                  <div className={styles.calendarAmount}>
                    {formatCurrency(total)}
                  </div>
                ) : null;
              }}
            />
            <div className={styles.selectedDateTransactions}>
              <h3>Transactions for {selectedDate.toLocaleDateString()}</h3>
              {selectedDateTransactions.length > 0 ? (
                <ul>
                  {selectedDateTransactions.map(t => (
                    <li key={t.id} className={styles.transactionItem}>
                      <span className={t.type === 'credit' ? styles.credit : styles.debit}>
                        {t.type.toUpperCase()}
                      </span>
                      <span>{formatCurrency(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No transactions for this date</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 