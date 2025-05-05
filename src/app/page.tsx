import styles from './page.module.scss';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to My Next.js App</h1>
      <p className={styles.description}>
        This is a Next.js application using SCSS modules for styling
      </p>
    </main>
  );
}
