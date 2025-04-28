'use client'
import { useAuth0 } from '@auth0/auth0-react';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const router = useRouter();

    const handleLogin = () => {
        loginWithRedirect();
    };

    if (isAuthenticated) {
        router.push('/dashboard');
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to continue managing your finances</p>
                
                <div className={styles.formContainer}>
                    <button 
                        className={styles.loginButton}
                        onClick={handleLogin}
                    >
                        Log in
                    </button>
                    
                    <div className={styles.divider}>
                        <span>or</span>
                    </div>
                    
                    <p className={styles.signupLink}>
                        Don&apos;t have an account?{' '}
                        <a href="/auth/signup">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;