import { AppButton } from '@/components/AppButton';
import styles from './page.module.scss';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.message}>
          This board is empty. Create a new column to get started.
        </div>
        <AppButton variant="primary" size="large">
          + Add New Column
        </AppButton>
      </div>
    </main>
  );
}
