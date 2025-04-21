'use client';

import Tabs from '@/components/Tabs/Tabs';
import {
    TrackContent,
    CreditContent,
    DebitContent,
    SavingsContent
} from '@/components/TabContents/TabContents';
import styles from './page.module.scss';

const DashboardPage = () => {
    const tabs = [
        { id: 'track', label: 'Track', content: <TrackContent /> },
        { id: 'credit', label: 'Credit', content: <CreditContent /> },
        { id: 'debit', label: 'Debit', content: <DebitContent /> },
        { id: 'savings', label: 'Savings', content: <SavingsContent /> },
    ];

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.content}>
                <Tabs tabs={tabs} />
            </div>
        </div>
    );
};

export default DashboardPage;