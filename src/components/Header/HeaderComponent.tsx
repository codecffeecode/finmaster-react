import Link from "next/link"
import styles from "./header.module.scss";

const HeaderComponent = () => {
    return <header className={styles.header}>
        <div className={styles.header__logo}><span className={styles.header__logo__first}>Fin</span>Master</div>
        <nav className={styles.header__nav}>
            <Link href="/">Dashboard</Link>
            <Link href="/about">Analysis</Link>
            <Link href="/about">Profile</Link>
        </nav>
    </header>
}

export default HeaderComponent;