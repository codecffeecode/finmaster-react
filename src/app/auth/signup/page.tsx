'use client'
import { useAuth0 } from '@auth0/auth0-react';
import styles from './signup.module.scss';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const router = useRouter();

    const handleSignup = () => {
        loginWithRedirect({
            authorizationParams: {
                screen_hint: 'signup',
            },
        });
    };

    if (isAuthenticated) {
        router.push('/dashboard');
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.signupCard}>
                <h1 className={styles.title}>Create Your Account</h1>
                <p className={styles.subtitle}>Join FinMaster to manage your finances effectively</p>
                
                <div className={styles.formContainer}>
                    <button 
                        className={styles.signupButton}
                        onClick={handleSignup}
                    >
                        Sign Up
                    </button>
                    
                    <div className={styles.divider}>
                        <span>or</span>
                    </div>
                    
                    <p className={styles.loginLink}>
                        Already have an account?{' '}
                        <a href="/auth/login">Log in</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage; 