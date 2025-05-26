'use client';

import { useState } from 'react';
import { z } from 'zod';
import styles from './add-project-form.module.scss';
import { useCreateProject } from '@/hooks/useProjects';
import { AppInput } from '../input/AppInput';
import { AppButton } from '../button/AppButton';

const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" })
});

type ProjectFormData = z.infer<typeof projectSchema>;
type FormErrors = Partial<Record<keyof ProjectFormData, string>>;

interface AddProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProjectForm({ onClose, onSuccess }: AddProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Use the mutation hook from TanStack Query
  const createProjectMutation = useCreateProject();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationResult = projectSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      const newErrors: FormErrors = {};

      if (formattedErrors.title?._errors.length) {
        newErrors.title = formattedErrors.title._errors[0];
      }

      if (formattedErrors.description?._errors.length) {
        newErrors.description = formattedErrors.description._errors[0];
      }

      setErrors(newErrors);
      return;
    }

    // Submit the form using the mutation
    createProjectMutation.mutate(formData, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Project Title
        </label>
        <AppInput
          id="title"
          value={formData.title}
          onChange={(value) => handleInputChange({ target: { name: 'title', value } } as any)}
          className={errors.title ? styles.error : ''}
        />
        {errors.title && (
          <div className={styles.errorText}>{errors.title}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <AppInput
          id="description"
          value={formData.description}
          onChange={(value) => handleInputChange({ target: { name: 'description', value } } as any)}
          className={errors.description ? styles.error : ''}
        />
        {errors.description && (
          <div className={styles.errorText}>{errors.description}</div>
        )}
      </div>

      {createProjectMutation.isError && (
        <div className={styles.error}>
          {createProjectMutation.error instanceof Error
            ? createProjectMutation.error.message
            : 'An error occurred while creating the project'}
        </div>
      )}

      <div className={styles.actions}>
        <AppButton
          type="button"
          onClick={onClose}
          variant="secondary">
          Cancel
        </AppButton>
        <AppButton
          type="submit"
          disabled={createProjectMutation.isPending}
          variant="primary">
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </AppButton>
      </div>
    </form>
  );
}

