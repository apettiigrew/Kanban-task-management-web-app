import { Card, useBoardContext } from '@/providers/board-context-provider';
import styles from './card-detail-modal.module.scss';
import { Modal } from './modal';
import { useState, useEffect } from 'react';
import { AppButton } from '@/components/button/AppButton';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
}

export function CardDetailModal({ isOpen, onClose, card }: CardDetailModalProps) {
  const { updateCardDescription } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize the description when the card changes
  useEffect(() => {
    if (card) {
      setDescription(card.description || '');
    }
  }, [card]);

  if (!card) return null;

  const handleEditClick = () => {
    setDescription(card.description || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!card) return;
    
    try {
      setIsSaving(true);
      await updateCardDescription(card.id.toString(), description);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save card description:', error);
      // Implementation could include a toast notification here for error feedback
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription(card.description || '');
    setIsEditing(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{card.title}</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Description</h4>
            </div>

            {isEditing ? (
              <div className={styles.editorContainer}>
                <MDEditor
                  value={description}
                  onChange={(value) => setDescription(value || '')}
                  preview="edit"
                  height={200}
                  textareaProps={{
                    placeholder: 'Write your description here...',
                    'aria-label': 'Markdown editor for card description'
                  }}
                />
                <div className={styles.actionButtons}>
                  <AppButton
                    onClick={handleCancel}
                    variant="secondary"
                    disabled={isSaving}
                  >
                    Cancel
                  </AppButton>
                  <AppButton
                    onClick={handleSave}
                    variant="primary"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </AppButton>
                </div>
              </div>
            ) : (
              <div 
                className={styles.description} 
                onClick={handleEditClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEditClick();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Click to edit description"
              >
                {card.description ? (
                  <ReactMarkdown
                    rehypePlugins={[rehypeSanitize, rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {card.description}
                  </ReactMarkdown>
                ) : (
                  <p className={styles.emptyDescription}>
                    No description provided. Click to add one.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
