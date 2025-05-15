import React, { useState } from 'react';
import styles from './AddList.module.scss';
import { AddCardButton, CloseButton } from '../button/AppButton';
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
          <CloseButton
            className={styles.closeButton}
            onClick={onCancel}
            icon={<CloseIcon />}
          />
        </div>
      </div>
    </ColumnWrapper>
  );
};

export default AddList;
