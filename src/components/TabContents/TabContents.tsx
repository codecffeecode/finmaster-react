import styles from './TabContents.module.scss';

export const TrackContent = () => (
    <div className={styles.tabContentSection}>
        <h2 className={styles.title}>Track Your Finances</h2>
        <p className={styles.description}>Monitor your financial activities and transactions here.</p>
    </div>
);

export const CreditContent = () => (
    <div className={styles.tabContentSection}>
        <h2 className={styles.title}>Credit Management</h2>
        <p className={styles.description}>View and manage your credit accounts and transactions.</p>
    </div>
);

export const DebitContent = () => (
    <div className={styles.tabContentSection}>
        <h2 className={styles.title}>Debit Overview</h2>
        <p className={styles.description}>Track your debit card transactions and balance.</p>
    </div>
);

export const SavingsContent = () => (
    <div className={styles.tabContentSection}>
        <h2 className={styles.title}>Savings Goals</h2>
        <p className={styles.description}>Set and monitor your savings targets and progress.</p>
    </div>
); 