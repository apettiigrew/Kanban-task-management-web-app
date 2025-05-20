import { Card, useBoardContext } from '@/providers/board-context-provider';
import styles from './card-detail-modal.module.scss';
import { Modal } from './modal';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { AppButton } from '@/components/button/AppButton';
import { Tiptap } from '../tiptap/tiptap';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
}

export function CardDetailModal({ isOpen, onClose, card }: CardDetailModalProps) {
  const { updateCardDescription, updateCardTitle } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize the description and title when the card changes
  useEffect(() => {
    if (card) {
      setDescription(card.description || '');
      setTitle(card.title || '');
    }
  }, [card]);

  // Auto-focus the title input when entering edit mode
  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isTitleEditing]);

  if (!card) return null;

  const handleEditClick = () => {
    setDescription(card.description || '');
    setIsEditing(true);
  };

  const handleTitleEditClick = () => {
    setTitle(card.title);
    setIsTitleEditing(true);
  };

  const handleTitleSave = async () => {
    if (!card) return;

    try {
      setIsTitleSaving(true);
      await updateCardTitle(card.id.toString(), title);
    } catch (error) {
      console.error('Failed to save card title:', error);
      // Implementation could include a toast notification here for error feedback
      setTitle(card.title); // Revert to original title on error
    } finally {
      setIsTitleSaving(false);
      setIsTitleEditing(false);
    }
  };

  const handleTitleCancel = () => {
    setTitle(card.title);
    setIsTitleEditing(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
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

  const handleTiptapChange = (newContent: string) => {
    setDescription(newContent);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          {isTitleEditing ? (
            <input
              ref={titleInputRef}
              type="text"
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              disabled={isTitleSaving}
              aria-label="Edit card title"
            />
          ) : (
            <h3
              className={styles.title}
              onClick={handleTitleEditClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTitleEditClick();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Click to edit title"
            >
              {card.title}
            </h3>
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Description</h4>
            </div>

            {isEditing ? (
              <div className={styles.editorContainer}>
                <Tiptap content={description}
                  onUpdate={handleTiptapChange} />
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
                {card.description ?
                 <p>{card.description}</p>

                  : (
                    <span className={styles.placeholder}>
                      Click to add a description...
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
