import React, { useState } from 'react';
import styles from './AddList.module.scss';
import { AddCardButton } from '../button/AppButton';
import { AddIcon, CloseIcon } from '../icons/icons';
import { ColumnWrapper } from '../column/ColumnWrapper';
import { AppInput } from '../input/AppInput';

interface AddListProps {
  onAdd: (name: string) => void;
  onCancel?: () => void;
}

const AddList: React.FC<AddListProps> = ({ onAdd, onCancel }) => {
  const [listName, setListName] = useState('');

  const handleAdd = () => {
    if (listName.trim()) {
      onAdd(listName.trim());
      setListName('');
    }
  };

  return (
    <ColumnWrapper>
      <div className={styles.addListContainer}>
        <AppInput
          value={listName}
          onChange={setListName}
          placeholder="Enter list name..."
          className={styles.input}
        />
        <div className={styles.actions}>
          <AddCardButton
            className={styles.addListButton}
            icon={<AddIcon />}
            onClick={handleAdd}
          >
            Add list
          </AddCardButton>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cancel"
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </ColumnWrapper>
  );
};

export default AddList;
