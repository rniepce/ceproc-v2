import { useState } from 'react';

const API_BASE = 'https://ceproc-v2-production.up.railway.app';

/**
 * useAPI - Wrapper para requisições HTTP com tratamento de erros
 */
export const useAPI = (url, method = 'GET') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (body = null) => {
    setLoading(true);
    setError(null);

    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
};
