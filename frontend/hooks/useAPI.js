import { useState } from 'react';

const API_BASE = 'https://ceproc-v2-production.up.railway.app';

/**
 * Extract a human-readable error message from a FastAPI error response.
 * Handles 422 Unprocessable Entity (Pydantic validation errors) as well as
 * plain { detail: string } responses.
 */
function extractErrorMessage(errorData, statusCode) {
  if (!errorData) return `HTTP ${statusCode}`;

  // FastAPI 422: detail is an array of validation error objects
  if (Array.isArray(errorData.detail)) {
    return errorData.detail
      .map((e) => {
        const loc = e.loc ? e.loc.join(' → ') : '';
        return loc ? `${loc}: ${e.msg}` : e.msg;
      })
      .join('; ');
  }

  // Standard FastAPI error: detail is a string
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }

  // Fallback
  return `HTTP ${statusCode}`;
}

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

      console.debug(`[useAPI] ${method} ${fullUrl}`, body ? { body } : '');

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // Response body is not JSON
        }
        const message = extractErrorMessage(errorData, response.status);
        console.error(`[useAPI] Error ${response.status} from ${fullUrl}:`, errorData);
        throw new Error(message);
      }

      const result = await response.json();
      console.debug(`[useAPI] Success from ${fullUrl}:`, result);
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
