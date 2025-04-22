'use client'
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import styles from './profile.module.scss';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
    const { user, logout, isLoading } = useAuth0();
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [lastLogin, setLastLogin] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            return;
        }

        if (user) {
            setUserName(user.name || 'User');
            setUserEmail(user.email || '');
            
            // Format last login time if available
            if (user.updated_at) {
                const date = new Date(user.updated_at);
                setLastLogin(date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }));
            }
        }
    }, [user, isLoading, router]);

    const handleLogout = () => {
        logout({ 
            logoutParams: {
                returnTo: 'http://localhost:3000/auth/login'
            }
        });
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.profileCard}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.profileCard}>
                    <h2>Please Login</h2>
                    <p>You need to be logged in to view your profile.</p>
                    <button 
                        className={styles.loginButton}
                        onClick={() => router.push('/auth/login')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {user?.picture ? (
                        <img src={user.picture} alt={userName} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h1 className={styles.userName}>{userName}</h1>
                {userEmail && <p className={styles.userEmail}>{userEmail}</p>}
                
                {lastLogin && (
                    <div className={styles.lastLogin}>
                        <span>Last login: {lastLogin}</span>
                    </div>
                )}
                
                <button 
                    className={styles.logoutButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;