import { Card } from '@/providers/board-context-provider';
import styles from './card-detail-modal.module.scss';
import { Modal } from './modal';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
}

export function CardDetailModal({ isOpen, onClose, card }: CardDetailModalProps) {
  if (!card) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{card.title}</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>
            <p className={styles.description}>
              {card.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
