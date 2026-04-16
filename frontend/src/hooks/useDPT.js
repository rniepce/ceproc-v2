import { useState, useCallback } from 'react';
import { useAPI } from './useAPI';

/**
 * useDPT - State management for DPT (Descrição de Processo Textual)
 * Handles extraction, validation, and updates of process descriptions
 */
export const useDPT = () => {
  const [dpt, setDptData] = useState(null);
  const [metadata, setMetadata] = useState({
    processo: '',
    analista: '',
    departamento: '',
    data: new Date().toISOString(),
  });

  const dptAPI = useAPI('/api/dpt', 'POST');
  const validateAPI = useAPI('/api/dpt/validate', 'POST');

  /**
   * Extract DPT from interview text using Azure OpenAI
   */
  const extractDPT = useCallback(
    async (interviewText) => {
      if (!interviewText || interviewText.trim().length < 100) {
        throw new Error('Interview text must be at least 100 characters');
      }

      const payload = {
        texto_entrevista: interviewText,
        metadados: metadata,
      };

      try {
        const result = await dptAPI.execute(payload);
        setDptData(result.dpt || result);
        return result;
      } catch (err) {
        console.error('Failed to extract DPT:', err);
        throw new Error(`DPT extraction failed: ${err.message}`);
      }
    },
    [metadata, dptAPI]
  );

  /**
   * Validate DPT structure (16 required fields)
   */
  const validateDPT = useCallback(
    async (dptToValidate = dpt) => {
      if (!dptToValidate) {
        throw new Error('No DPT data to validate');
      }

      try {
        const result = await validateAPI.execute(dptToValidate);
        return result;
      } catch (err) {
        console.error('DPT validation failed:', err);
        throw new Error(`Validation failed: ${err.message}`);
      }
    },
    [dpt, validateAPI]
  );

  /**
   * Update a specific field in DPT
   */
  const updateDPTField = useCallback((field, value) => {
    setDptData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  /**
   * Update multiple DPT fields
   */
  const updateDPTFields = useCallback((updates) => {
    setDptData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
      };
    });
  }, []);

  /**
   * Update metadata (process name, analyst, department, etc.)
   */
  const updateMetadata = useCallback((field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Get DPT field names and validation status
   */
  const getDPTStructure = useCallback(() => {
    const requiredFields = [
      'nome_processo',
      'descricao',
      'objetivo',
      'cliente_processo',
      'proprietario',
      'departamento_dono',
      'finalidade',
      'gatilho',
      'entrada',
      'saida',
      'frequencia',
      'tempo_ciclo',
      'etapas',
      'atores',
      'sistemas',
      'problemas_relatados',
    ];

    if (!dpt) {
      return {
        complete: false,
        presentFields: [],
        missingFields: requiredFields,
        percentage: 0,
      };
    }

    const presentFields = requiredFields.filter((field) => dpt[field] !== undefined && dpt[field] !== null && dpt[field] !== '');
    const missingFields = requiredFields.filter((field) => !presentFields.includes(field));

    return {
      complete: missingFields.length === 0,
      presentFields,
      missingFields,
      percentage: Math.round((presentFields.length / requiredFields.length) * 100),
    };
  }, [dpt]);

  /**
   * Reset DPT data
   */
  const resetDPT = useCallback(() => {
    setDptData(null);
    setMetadata({
      processo: '',
      analista: '',
      departamento: '',
      data: new Date().toISOString(),
    });
  }, []);

  return {
    // State
    dpt,
    metadata,
    loading: dptAPI.loading || validateAPI.loading,
    error: dptAPI.error || validateAPI.error,

    // Methods
    extractDPT,
    validateDPT,
    updateDPTField,
    updateDPTFields,
    updateMetadata,
    getDPTStructure,
    resetDPT,
    setDptData,
  };
};
