import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Degree, CreateDegreeForm } from '@/types/education';

export function useDegrees() {
  const { user, session } = useAuth();
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  };

  // Fetch all degrees for the user
  const fetchDegrees = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/degrees', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch degrees');
      }

      setDegrees(data.degrees || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching degrees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new degree
  const createDegree = async (degreeData: CreateDegreeForm): Promise<Degree | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/degrees', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(degreeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create degree');
      }

      const newDegree = data.degree;
      setDegrees(prev => [newDegree, ...prev]);
      return newDegree;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating degree:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific degree
  const getDegree = async (degreeId: string): Promise<Degree | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/degrees/${degreeId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch degree');
      }

      return data.degree;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching degree:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch degrees when user changes
  useEffect(() => {
    if (user && session) {
      fetchDegrees();
    } else {
      setDegrees([]);
    }
  }, [user, session]);

  return {
    degrees,
    isLoading,
    error,
    fetchDegrees,
    createDegree,
    getDegree,
    // Helper functions
    refreshDegrees: fetchDegrees,
    clearError: () => setError(null),
  };
} 