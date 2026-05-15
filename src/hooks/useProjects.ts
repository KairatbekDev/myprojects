import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Project } from '../types';

export interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export const useProjects = (): ProjectsState => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase.from('Projects').select('*');
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProjects((data as Project[]) ?? []);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  return { projects, isLoading, error };
};
