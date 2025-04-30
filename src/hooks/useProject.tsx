import { useEffect, useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { useSession } from 'next-auth/react';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const { status } = useSession();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        // If unauthorized, wait briefly and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResponse = await fetch('/api/projects', {
          credentials: 'include',
        });
        if (!retryResponse.ok) throw new Error('Failed to fetch projects');
        const data = await retryResponse.json();
        setProjects(data.projects);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch projects when the session is active
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, fetchProjects]);

  return { projects, loading, error, refetchProjects: fetchProjects, setProjects };
}