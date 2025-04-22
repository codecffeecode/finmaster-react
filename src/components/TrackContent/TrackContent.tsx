'use client'
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getDocuments } from '@/lib/firebase/firestore';
import { where, orderBy, QueryConstraint, limit, startAfter, query, getDocs, DocumentData, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import styles from './TrackContent.module.scss';

// Define the type for transactions
interface Transaction {
  id: string;
  label: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  userId: string;
  createdAt: string;
  type: 'credit' | 'debit';
}

const TrackContent = () => {
  const { user, isLoading } = useAuth0();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch transactions
  const fetchTransactions = async (isInitial = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Reset pagination if it's a new search or filter
      if (isInitial) {
        setLastVisible(null);
        setHasMore(true);
        setCurrentPage(1);
      }
      
      // Build query constraints
      const constraints: QueryConstraint[] = [
        where('userId', '==', user.sub)
      ];
      
      
      // Add sorting
      constraints.push(orderBy(sortBy, sortOrder));
      
      // Add pagination
      constraints.push(limit(pageSize));
      
      // If not initial load and we have a last visible document, start after it
      if (!isInitial && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      // Get transactions from both collections
      let allTransactions: Transaction[] = [];
      
      if (filterType === 'all' || filterType === 'credit') {
        const creditQuery = query(collection(db, 'creditTransactions'), ...constraints);
        const creditSnapshot = await getDocs(creditQuery);
        const creditTransactions = creditSnapshot.docs.map(doc => ({
          ...(doc.data() as Omit<Transaction, 'id' | 'type'>),
          id: doc.id,
          type: 'credit' as const
        }));
        allTransactions = [...allTransactions, ...creditTransactions];
      }
      
      if (filterType === 'all' || filterType === 'debit') {
        const debitQuery = query(collection(db, 'debitTransactions'), ...constraints);
        const debitSnapshot = await getDocs(debitQuery);
        const debitTransactions = debitSnapshot.docs.map(doc => ({
          ...(doc.data() as Omit<Transaction, 'id' | 'type'>),
          id: doc.id,
          type: 'debit' as const
        }));
        allTransactions = [...allTransactions, ...debitTransactions];
      }
      
      // Update last visible document for pagination
      if (allTransactions.length > 0) {
        const lastDoc = allTransactions[allTransactions.length - 1];
        setLastVisible(lastDoc);
      }
      
      // Check if we have more data to load
      setHasMore(allTransactions.length === pageSize);
      
      // Apply search filter if needed
      let filteredTransactions = allTransactions;
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredTransactions = allTransactions.filter(transaction => 
          transaction.title.toLowerCase().includes(lowerSearchTerm) ||
          transaction.label.toLowerCase().includes(lowerSearchTerm) ||
          (transaction.description && transaction.description.toLowerCase().includes(lowerSearchTerm))
        );
      }
      
      // Update transactions state
      if (isInitial) {
        setTransactions(filteredTransactions);
      } else {
        setTransactions(prev => [...prev, ...filteredTransactions]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isLoading && user) {
      fetchTransactions(true);
    }
  }, [user, isLoading, filterType, sortBy, sortOrder, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (type: 'all' | 'credit' | 'debit') => {
    setFilterType(type);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (field: 'date' | 'amount', order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Load more transactions
  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
      fetchTransactions(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <p>You need to be logged in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.sectionTitle}>All Transactions</h2>
          
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by title, label, or description"
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`${styles.filterButton} ${filterType === 'credit' ? styles.active : ''}`}
                onClick={() => handleFilterChange('credit')}
              >
                Credit
              </button>
              <button 
                className={`${styles.filterButton} ${filterType === 'debit' ? styles.active : ''}`}
                onClick={() => handleFilterChange('debit')}
              >
                Debit
              </button>
            </div>
            
            <div className={styles.sortButtons}>
              <button 
                className={`${styles.sortButton} ${sortBy === 'date' && sortOrder === 'desc' ? styles.active : ''}`}
                onClick={() => handleSortChange('date', 'desc')}
              >
                Newest
              </button>
              <button 
                className={`${styles.sortButton} ${sortBy === 'date' && sortOrder === 'asc' ? styles.active : ''}`}
                onClick={() => handleSortChange('date', 'asc')}
              >
                Oldest
              </button>
              <button 
                className={`${styles.sortButton} ${sortBy === 'amount' && sortOrder === 'desc' ? styles.active : ''}`}
                onClick={() => handleSortChange('amount', 'desc')}
              >
                Highest
              </button>
              <button 
                className={`${styles.sortButton} ${sortBy === 'amount' && sortOrder === 'asc' ? styles.active : ''}`}
                onClick={() => handleSortChange('amount', 'asc')}
              >
                Lowest
              </button>
            </div>
          </div>
        </div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.transactionsSection}>
          {loading && transactions.length === 0 ? (
            <div className={styles.loadingSpinner}></div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No transactions found.</p>
              <p>Try adjusting your filters or add new transactions.</p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map(transaction => (
                <div 
                  key={`${transaction.type}-${transaction.id}`} 
                  className={`${styles.transactionCard} ${transaction.type === 'credit' ? styles.creditCard : styles.debitCard}`}
                >
                  <div className={styles.transactionHeader}>
                    <span className={`${styles.transactionLabel} ${transaction.type === 'credit' ? styles.creditLabel : styles.debitLabel}`}>
                      {transaction.label}
                    </span>
                    <span className={styles.transactionDate}>{formatDate(transaction.date)}</span>
                  </div>
                  <h3 className={styles.transactionTitle}>{transaction.title}</h3>
                  {transaction.description && (
                    <p className={styles.transactionDescription}>{transaction.description}</p>
                  )}
                  <div className={styles.transactionFooter}>
                    <div className={`${styles.transactionAmount} ${transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                    <span className={`${styles.transactionType} ${transaction.type === 'credit' ? styles.creditType : styles.debitType}`}>
                      {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {hasMore && (
            <div className={styles.loadMoreSection}>
              <button 
                className={styles.loadMoreButton}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackContent; 