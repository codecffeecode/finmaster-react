import styles from './TabContents.module.scss';
import CreditContentComponent from '../CreditContent/CreditContent';
import DebitContentComponent from '../DebitContent/DebitContent';
import TrackContentComponent from '../TrackContent/TrackContent';

export const TrackContent = () => <TrackContentComponent />;

export const CreditContent = () => (
    <div className={styles.tabContentSection}>
        <CreditContentComponent />
    </div>
);

export const DebitContent = () => (
    <div className={styles.tabContentSection}>
        <DebitContentComponent />
    </div>
);

export const SavingsContent = () => (
    <div className={styles.tabContentSection}>
        <h2 className={styles.title}>Savings Goals</h2>
        <p className={styles.description}>Set and monitor your savings targets and progress.</p>
    </div>
); 