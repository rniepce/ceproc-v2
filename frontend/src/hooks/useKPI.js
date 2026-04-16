import { useState, useCallback } from 'react';
import { useAPI } from './useAPI';

/**
 * useKPI - State management for KPI (Key Performance Indicators)
 * Handles generation, validation, and updates of 16-column KPI structure
 */
export const useKPI = () => {
  const [kpis, setKPIs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    criticality: 'all', // high, medium, low, all
    periodicity: null, // diária, semanal, mensal, trimestral, anual
    polarity: null, // maximizar, minimizar, manter
  });

  const generateAPI = useAPI('/api/kpi', 'POST');
  const validateAPI = useAPI('/api/kpi/validate', 'POST');
  const batchValidateAPI = useAPI('/api/kpi/batch-validate', 'POST');

  /**
   * Generate KPI indicators from DPT using Azure OpenAI
   */
  const generateKPIs = useCallback(
    async (dpt, processName = '', focusAreas = []) => {
      if (!dpt) {
        throw new Error('DPT data is required to generate KPIs');
      }

      const payload = {
        dpt,
        process_name: processName,
        filter_by_criticality: filters.criticality,
        focus_areas: focusAreas,
      };

      try {
        const result = await generateAPI.execute(payload);
        setKPIs(result.kpis || []);
        setSummary(result.summary || null);
        return result;
      } catch (err) {
        console.error('Failed to generate KPIs:', err);
        throw new Error(`KPI generation failed: ${err.message}`);
      }
    },
    [filters.criticality, generateAPI]
  );

  /**
   * Validate a single KPI structure (16-column format)
   */
  const validateKPI = useCallback(
    async (kpi) => {
      if (!kpi) {
        throw new Error('No KPI data to validate');
      }

      try {
        const result = await validateAPI.execute(kpi);
        return result;
      } catch (err) {
        console.error('KPI validation failed:', err);
        throw new Error(`Validation failed: ${err.message}`);
      }
    },
    [validateAPI]
  );

  /**
   * Validate multiple KPIs at once
   */
  const batchValidateKPIs = useCallback(
    async (kpisToValidate = kpis) => {
      if (!kpisToValidate || kpisToValidate.length === 0) {
        throw new Error('No KPIs to validate');
      }

      try {
        const result = await batchValidateAPI.execute(kpisToValidate);
        return result;
      } catch (err) {
        console.error('Batch validation failed:', err);
        throw new Error(`Batch validation failed: ${err.message}`);
      }
    },
    [kpis, batchValidateAPI]
  );

  /**
   * Update a specific KPI
   */
  const updateKPI = useCallback((kpiIndex, updates) => {
    setKPIs((prev) => {
      const newKPIs = [...prev];
      if (newKPIs[kpiIndex]) {
        newKPIs[kpiIndex] = { ...newKPIs[kpiIndex], ...updates };
      }
      return newKPIs;
    });
  }, []);

  /**
   * Update a specific field in a KPI
   */
  const updateKPIField = useCallback((kpiIndex, field, value) => {
    setKPIs((prev) => {
      const newKPIs = [...prev];
      if (newKPIs[kpiIndex]) {
        newKPIs[kpiIndex][field] = value;
      }
      return newKPIs;
    });
  }, []);

  /**
   * Add a new KPI to the list
   */
  const addKPI = useCallback((newKPI = {}) => {
    const defaultKPI = {
      indicador: '',
      objetivo: '',
      processo: '',
      cliente: '',
      metadados: '',
      fonte_extracao: '',
      formula_calculo: '',
      unidade: '',
      filtro: '',
      meta: '',
      periodicidade: '',
      polaridade: '',
      responsavel: '',
      criticidade: '',
      justificativa: '',
    };

    setKPIs((prev) => [...prev, { ...defaultKPI, ...newKPI }]);
  }, []);

  /**
   * Delete a KPI by index
   */
  const deleteKPI = useCallback((kpiIndex) => {
    setKPIs((prev) => prev.filter((_, index) => index !== kpiIndex));
  }, []);

  /**
   * Filter KPIs by criticality level
   */
  const filterByCriticality = useCallback(
    (level) => {
      setFilters((prev) => ({ ...prev, criticality: level }));
    },
    []
  );

  /**
   * Filter KPIs by periodicity
   */
  const filterByPeriodicity = useCallback(
    (periodicity) => {
      setFilters((prev) => ({ ...prev, periodicity }));
    },
    []
  );

  /**
   * Filter KPIs by polarity
   */
  const filterByPolarity = useCallback(
    (polarity) => {
      setFilters((prev) => ({ ...prev, polarity }));
    },
    []
  );

  /**
   * Get filtered KPIs based on current filters
   */
  const getFilteredKPIs = useCallback(() => {
    return kpis.filter((kpi) => {
      if (filters.criticality !== 'all' && kpi.criticidade !== filters.criticality) {
        return false;
      }
      if (filters.periodicity && kpi.periodicidade !== filters.periodicity) {
        return false;
      }
      if (filters.polarity && kpi.polaridade !== filters.polarity) {
        return false;
      }
      return true;
    });
  }, [kpis, filters]);

  /**
   * Get KPI statistics
   */
  const getKPIStats = useCallback(() => {
    if (!kpis || kpis.length === 0) {
      return {
        total: 0,
        byCriticality: {},
        byPeriodicity: {},
        byPolarity: {},
        averageFields: 0,
      };
    }

    const byCriticality = {};
    const byPeriodicity = {};
    const byPolarity = {};
    let totalFields = 0;

    kpis.forEach((kpi) => {
      // Count by criticality
      const crit = kpi.criticidade || 'unknown';
      byCriticality[crit] = (byCriticality[crit] || 0) + 1;

      // Count by periodicity
      const period = kpi.periodicidade || 'unknown';
      byPeriodicity[period] = (byPeriodicity[period] || 0) + 1;

      // Count by polarity
      const polar = kpi.polaridade || 'unknown';
      byPolarity[polar] = (byPolarity[polar] || 0) + 1;

      // Count filled fields
      const requiredFields = [
        'indicador',
        'objetivo',
        'processo',
        'cliente',
        'metadados',
        'fonte_extracao',
        'formula_calculo',
        'unidade',
        'filtro',
        'meta',
        'periodicidade',
        'polaridade',
        'responsavel',
        'criticidade',
        'justificativa',
      ];
      const filledFields = requiredFields.filter((field) => kpi[field] && kpi[field].trim().length > 0);
      totalFields += filledFields.length;
    });

    return {
      total: kpis.length,
      byCriticality,
      byPeriodicity,
      byPolarity,
      averageFields: Math.round(totalFields / Math.max(kpis.length, 1)),
      completionPercentage: Math.round((totalFields / (kpis.length * 15)) * 100),
    };
  }, [kpis]);

  /**
   * Export KPIs as CSV
   */
  const exportAsCSV = useCallback(() => {
    if (!kpis || kpis.length === 0) {
      throw new Error('No KPIs to export');
    }

    const headers = [
      'indicador',
      'objetivo',
      'processo',
      'cliente',
      'metadados',
      'fonte_extracao',
      'formula_calculo',
      'unidade',
      'filtro',
      'meta',
      'periodicidade',
      'polaridade',
      'responsavel',
      'criticidade',
      'justificativa',
    ];

    const rows = kpis.map((kpi) =>
      headers.map((field) => {
        const value = kpi[field] || '';
        // Escape quotes in CSV
        return `"${value.toString().replace(/"/g, '""')}"`;
      })
    );

    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csv;
  }, [kpis]);

  /**
   * Reset KPI data
   */
  const resetKPIs = useCallback(() => {
    setKPIs([]);
    setSummary(null);
    setFilters({
      criticality: 'all',
      periodicity: null,
      polarity: null,
    });
  }, []);

  return {
    // State
    kpis,
    summary,
    filters,
    loading: generateAPI.loading || validateAPI.loading || batchValidateAPI.loading,
    error: generateAPI.error || validateAPI.error || batchValidateAPI.error,

    // Methods
    generateKPIs,
    validateKPI,
    batchValidateKPIs,
    updateKPI,
    updateKPIField,
    addKPI,
    deleteKPI,
    filterByCriticality,
    filterByPeriodicity,
    filterByPolarity,
    getFilteredKPIs,
    getKPIStats,
    exportAsCSV,
    resetKPIs,
    setKPIs,
  };
};
