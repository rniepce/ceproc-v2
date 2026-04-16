import { useState, useCallback } from 'react';
import { useAPI } from './useAPI';

/**
 * useBPMN - State management for BPMN diagrams
 * Handles generation, validation, and updates of BPMN structures
 */
export const useBPMN = () => {
  const [bpmn, setBpmn] = useState(null);
  const [bpmnXML, setBpmnXML] = useState(null);
  const [validation, setValidation] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  const generateAPI = useAPI('/api/bpmn', 'POST');
  const xmlAPI = useAPI('/api/bpmn/xml', 'POST');
  const validateAPI = useAPI('/api/bpmn/validate', 'POST');

  /**
   * Generate BPMN from DPT using Azure OpenAI
   */
  const generateBPMN = useCallback(
    async (dpt) => {
      if (!dpt) {
        throw new Error('DPT data is required to generate BPMN');
      }

      const payload = {
        dpt,
        include_coordinates: true,
        include_visualization: true,
      };

      try {
        const result = await generateAPI.execute(payload);
        setBpmn(result.bpmn_json || result);
        setValidation(result.validation || null);
        return result;
      } catch (err) {
        console.error('Failed to generate BPMN:', err);
        throw new Error(`BPMN generation failed: ${err.message}`);
      }
    },
    [generateAPI]
  );

  /**
   * Generate BPMN 2.0 XML from BPMN JSON
   */
  const generateBPMNXML = useCallback(
    async (dpt, bpmnData = bpmn) => {
      if (!dpt && !bpmnData) {
        throw new Error('DPT or BPMN data is required');
      }

      const payload = {
        dpt,
        include_coordinates: true,
        include_visualization: true,
      };

      try {
        const result = await xmlAPI.execute(payload);
        setBpmnXML(result.bpmn_xml);
        setBpmn(result.bpmn_json);
        return result;
      } catch (err) {
        console.error('Failed to generate BPMN XML:', err);
        throw new Error(`BPMN XML generation failed: ${err.message}`);
      }
    },
    [bpmn, xmlAPI]
  );

  /**
   * Validate BPMN structure
   */
  const validateBPMN = useCallback(
    async (bpmnToValidate = bpmn) => {
      if (!bpmnToValidate) {
        throw new Error('No BPMN data to validate');
      }

      try {
        const result = await validateAPI.execute(bpmnToValidate);
        setValidation(result);
        return result;
      } catch (err) {
        console.error('BPMN validation failed:', err);
        throw new Error(`Validation failed: ${err.message}`);
      }
    },
    [bpmn, validateAPI]
  );

  /**
   * Get BPMN element statistics
   */
  const getBPMNStats = useCallback(() => {
    if (!bpmn) {
      return {
        totalElements: 0,
        activities: 0,
        gateways: 0,
        flows: 0,
        pools: 0,
        isValid: false,
      };
    }

    return {
      totalElements:
        (bpmn.activities?.length || 0) +
        (bpmn.gateways?.length || 0) +
        (bpmn.pools?.length || 0) +
        2, // +2 for start and end events
      activities: bpmn.activities?.length || 0,
      gateways: bpmn.gateways?.length || 0,
      flows: bpmn.sequenceFlows?.length || 0,
      pools: bpmn.pools?.length || 0,
      isValid: validation?.is_valid || false,
    };
  }, [bpmn, validation]);

  /**
   * Update a BPMN activity
   */
  const updateActivity = useCallback((activityId, updates) => {
    setBpmn((prev) => {
      if (!prev || !prev.activities) return prev;
      return {
        ...prev,
        activities: prev.activities.map((activity) =>
          activity.id === activityId ? { ...activity, ...updates } : activity
        ),
      };
    });
  }, []);

  /**
   * Update a BPMN gateway
   */
  const updateGateway = useCallback((gatewayId, updates) => {
    setBpmn((prev) => {
      if (!prev || !prev.gateways) return prev;
      return {
        ...prev,
        gateways: prev.gateways.map((gateway) =>
          gateway.id === gatewayId ? { ...gateway, ...updates } : gateway
        ),
      };
    });
  }, []);

  /**
   * Update a sequence flow
   */
  const updateFlow = useCallback((flowId, updates) => {
    setBpmn((prev) => {
      if (!prev || !prev.sequenceFlows) return prev;
      return {
        ...prev,
        sequenceFlows: prev.sequenceFlows.map((flow) =>
          flow.id === flowId ? { ...flow, ...updates } : flow
        ),
      };
    });
  }, []);

  /**
   * Get coordinates for an element
   */
  const getElementCoordinates = useCallback(
    (elementId) => {
      if (!bpmn) return null;

      const activity = bpmn.activities?.find((a) => a.id === elementId);
      if (activity) return { x: activity.x, y: activity.y };

      const gateway = bpmn.gateways?.find((g) => g.id === elementId);
      if (gateway) return { x: gateway.x, y: gateway.y };

      return null;
    },
    [bpmn]
  );

  /**
   * Reset BPMN data
   */
  const resetBPMN = useCallback(() => {
    setBpmn(null);
    setBpmnXML(null);
    setValidation(null);
    setSelectedElement(null);
  }, []);

  return {
    // State
    bpmn,
    bpmnXML,
    validation,
    selectedElement,
    loading: generateAPI.loading || xmlAPI.loading || validateAPI.loading,
    error: generateAPI.error || xmlAPI.error || validateAPI.error,

    // Methods
    generateBPMN,
    generateBPMNXML,
    validateBPMN,
    getBPMNStats,
    updateActivity,
    updateGateway,
    updateFlow,
    getElementCoordinates,
    setSelectedElement,
    resetBPMN,
    setBpmn,
  };
};
