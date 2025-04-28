'use client'
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getDocuments, createDocument } from '@/lib/firebase/firestore';
import { where, QueryConstraint } from 'firebase/firestore';
import styles from './CreditContent.module.scss';

// Define the type for credit transactions
interface CreditTransaction {
  id: string;
  label: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  userId: string;
  createdAt: string;
}

const CreditContent = () => {
  const { user, isLoading } = useAuth0();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating new transaction
  const [formData, setFormData] = useState({
    label: '',
    title: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch credit transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const constraints: QueryConstraint[] = [
          where('userId', '==', user.sub)
        ];
        
        const userTransactions = await getDocuments<CreditTransaction>('creditTransactions', constraints);
        
        // Sort by date (newest first)
        const sortedTransactions = userTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setTransactions(sortedTransactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchTransactions();
    }
  }, [user, isLoading]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create transactions');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.label || !formData.title || !formData.amount || !formData.date) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Create new transaction
      const newTransaction = {
        label: formData.label,
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        userId: user.sub || '',
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      const docId = await createDocument('creditTransactions', newTransaction);
      
      // Add to local state
      setTransactions(prev => [
        { ...newTransaction, id: docId },
        ...prev
      ]);
      
      // Reset form
      setFormData({
        label: '',
        title: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setError(null);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <p>You need to be logged in to view and manage your credit transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.transactionsSection}>
          <h2 className={styles.sectionTitle}>Your Credit Transactions</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {loading ? (
            <div className={styles.loadingSpinner}></div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You don&apos;t have any credit transactions yet.</p>
              <p>Add your first transaction using the form below.</p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map(transaction => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.transactionHeader}>
                    <span className={styles.transactionLabel}>{transaction.label}</span>
                    <span className={styles.transactionDate}>{formatDate(transaction.date)}</span>
                  </div>
                  <h3 className={styles.transactionTitle}>{transaction.title}</h3>
                  {transaction.description && (
                    <p className={styles.transactionDescription}>{transaction.description}</p>
                  )}
                  <div className={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Add New Transaction</h2>
          <form onSubmit={handleSubmit} className={styles.transactionForm}>
            <div className={styles.formGroup}>
              <label htmlFor="label">Label*</label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g., Groceries, Entertainment"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Weekly Grocery Shopping"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add details about this transaction"
                rows={3}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount*</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="date">Date*</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreditContent; 