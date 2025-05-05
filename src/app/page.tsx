import { AppButton } from '@/components/AppButton';
import { AddIcon } from '@/components/AddIcon';
import styles from './page.module.scss';
import Heading from '@/components/Heading';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.message}>
          <Heading>
            This board is empty. Create a new column to get started.
          </Heading>
        </div>
        <AppButton variant="primary" size="large">
          <AddIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Add New Column
        </AppButton>
      </div>
    </main>
  );
}
