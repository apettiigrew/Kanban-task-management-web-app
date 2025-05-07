'use client';

import { createProject } from '@/actions/projectActions';
import { useActionState, useEffect } from 'react';
import { z } from 'zod';
import styles from './add-project-form.module.scss';

const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" })
});

type ProjectFormData = z.infer<typeof projectSchema>;
type FormErrors = Partial<Record<keyof ProjectFormData, string>>;

type ProjectValidationResult = {
  success: boolean;
  errors?: z.ZodFormattedError<{
    title: string;
    description: string;
  }>;
  message?: string;
};

const initialState: ProjectValidationResult = {
  success: false,
};

interface AddProjectFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddProjectForm({ onClose, onSuccess }: AddProjectFormProps) {
  const [state, formAction, pending] = useActionState(createProject, initialState);

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
      onClose();
    }
  }, [state, onSuccess, onClose]);

  const errors: FormErrors = {};
  if (state?.errors) {
    if (state.errors.title?._errors.length) {
      errors.title = state.errors.title._errors[0];
    }
    if (state.errors.description?._errors.length) {
      errors.description = state.errors.description._errors[0];
    }
  }

  const serverError = state && !state.success ? state.message : '';

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Project Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`${styles.input} ${errors.title ? styles.error : ''}`}
        />
        {errors.title && (
          <div className={styles.errorText}>{errors.title}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
        />
        {errors.description && (
          <div className={styles.errorText}>{errors.description}</div>
        )}
      </div>

      {/* {serverError && (
        <div className={styles.error}>{serverError}</div>
      )} */}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onClose}
          className={`${styles.button} ${styles.cancelButton}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className={`${styles.button} ${styles.submitButton}`}
        >
          {pending ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}

