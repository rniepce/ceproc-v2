import { useState, useCallback } from 'react';

/**
 * useWorkflow - Centralized state management for the entire CEPROC V2 workflow.
 *
 * Stores all data produced across wizard steps so every page can read and
 * write to a single source of truth without prop-drilling through App.jsx.
 *
 * Shape:
 *   entrada   – raw interview text + metadata fields
 *   dpt       – extracted DPT object returned by /api/dpt
 *   bpmn      – generated BPMN JSON returned by /api/bpmn
 *   kpis      – array of KPI objects returned by /api/kpi
 *   gargalos  – bottleneck analysis returned by /api/gargalos
 *   versioning – simple version counter for future iteration tracking
 */
export const useWorkflow = () => {
  const [entrada, setEntradaState] = useState({
    interviewText: '',
    metadata: {
      processo: '',
      analista: '',
      departamento: '',
      data: new Date().toISOString().split('T')[0],
    },
  });

  const [dpt, setDPTState] = useState(null);
  const [bpmn, setBPMNState] = useState(null);
  const [kpis, setKPIsState] = useState([]);
  const [gargalos, setGargalosState] = useState(null);
  const [versioning, setVersioning] = useState({
    version: 'v1',
    iterations: [],
  });

  // ── Entrada ──────────────────────────────────────────────────────────────

  /** Update the interview text */
  const setEntrada = useCallback((interviewText, metadata) => {
    setEntradaState((prev) => ({
      interviewText: interviewText !== undefined ? interviewText : prev.interviewText,
      metadata: metadata !== undefined ? { ...prev.metadata, ...metadata } : prev.metadata,
    }));
  }, []);

  /** Update a single metadata field */
  const updateMetadata = useCallback((field, value) => {
    setEntradaState((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  }, []);

  // ── DPT ──────────────────────────────────────────────────────────────────

  /** Store the full DPT response from /api/dpt */
  const setDPT = useCallback((dptData) => {
    setDPTState(dptData);
    setVersioning((prev) => ({
      ...prev,
      iterations: [
        ...prev.iterations,
        { tipo: 'DPT', versao: prev.version, timestamp: new Date().toISOString() },
      ],
    }));
  }, []);

  /** Update a single field inside the DPT object */
  const updateDPTField = useCallback((field, value) => {
    setDPTState((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  // ── BPMN ─────────────────────────────────────────────────────────────────

  /** Store the full BPMN response from /api/bpmn */
  const setBPMN = useCallback((bpmnData) => {
    setBPMNState(bpmnData);
    setVersioning((prev) => ({
      ...prev,
      iterations: [
        ...prev.iterations,
        { tipo: 'BPMN', versao: prev.version, timestamp: new Date().toISOString() },
      ],
    }));
  }, []);

  // ── KPIs ─────────────────────────────────────────────────────────────────

  /** Store the KPI array from /api/kpi */
  const setKPIs = useCallback((kpiData) => {
    setKPIsState(Array.isArray(kpiData) ? kpiData : []);
  }, []);

  /** Update a single field in one KPI */
  const updateKPIField = useCallback((index, field, value) => {
    setKPIsState((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  // ── Gargalos ─────────────────────────────────────────────────────────────

  /** Store the bottleneck analysis from /api/gargalos */
  const setGargalos = useCallback((gargalosData) => {
    setGargalosState(gargalosData);
    setVersioning((prev) => ({
      ...prev,
      iterations: [
        ...prev.iterations,
        { tipo: 'Gargalos', versao: prev.version, timestamp: new Date().toISOString() },
      ],
    }));
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────

  /** Reset the entire workflow back to initial state */
  const resetWorkflow = useCallback(() => {
    setEntradaState({
      interviewText: '',
      metadata: {
        processo: '',
        analista: '',
        departamento: '',
        data: new Date().toISOString().split('T')[0],
      },
    });
    setDPTState(null);
    setBPMNState(null);
    setKPIsState([]);
    setGargalosState(null);
    setVersioning({ version: 'v1', iterations: [] });
  }, []);

  // ── Derived helpers ───────────────────────────────────────────────────────

  /** True when the minimum data needed to proceed past step 1 is present */
  const hasEntrada = Boolean(
    entrada.interviewText &&
      entrada.interviewText.trim().length >= 100 &&
      entrada.metadata.processo
  );

  /** True when a DPT has been extracted */
  const hasDPT = Boolean(dpt);

  /** True when a BPMN has been generated */
  const hasBPMN = Boolean(bpmn);

  /** True when KPIs have been generated */
  const hasKPIs = kpis.length > 0;

  return {
    // State
    entrada,
    dpt,
    bpmn,
    kpis,
    gargalos,
    versioning,

    // Derived
    hasEntrada,
    hasDPT,
    hasBPMN,
    hasKPIs,

    // Setters
    setEntrada,
    updateMetadata,
    setDPT,
    updateDPTField,
    setBPMN,
    setKPIs,
    updateKPIField,
    setGargalos,
    resetWorkflow,
  };
};
