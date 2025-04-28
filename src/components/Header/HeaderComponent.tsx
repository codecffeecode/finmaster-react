'use client'
import Link from "next/link"
import styles from "./header.module.scss";
import { useAuth0 } from "@auth0/auth0-react";
const HeaderComponent = () => {
    const { user, isAuthenticated } = useAuth0();
    return <header className={styles.header}>
        <div className={styles.header__logo}><span className={styles.header__logo__first}>Fin</span>Master</div>
        <nav className={styles.header__nav}>
            {isAuthenticated && (
                <>
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/analysis">Analysis</Link>
                    <Link href="/profile">Hello {user?.name}</Link>
                </>
            )}
            {!isAuthenticated && (
                <>
                    <Link href="/auth/login">Login</Link>
                    <Link href="/auth/signup">Register</Link>
                </>
            )}
        </nav>
    </header>
}

export default HeaderComponent;