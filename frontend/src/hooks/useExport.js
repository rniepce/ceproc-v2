import { useState, useCallback } from 'react';
import { useAPI } from './useAPI';

/**
 * useExport - State management for file exports
 * Handles DOCX, XLSX, BPMN XML, and ZIP exports
 */
export const useExport = () => {
  const [exportHistory, setExportHistory] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState({
    docx: false,
    xlsx: false,
    bpmn: false,
    zip: false,
  });

  const docxAPI = useAPI('/api/export/docx', 'POST');
  const xlsxAPI = useAPI('/api/export/xlsx', 'POST');
  const bpmnAPI = useAPI('/api/export/bpmn', 'POST');
  const zipAPI = useAPI('/api/export/zip', 'POST');
  const formatsAPI = useAPI('/api/export/formats', 'GET');

  /**
   * Get available export formats
   */
  const getAvailableFormats = useCallback(async () => {
    try {
      const result = await formatsAPI.execute();
      return result.formats || [];
    } catch (err) {
      console.error('Failed to get export formats:', err);
      throw new Error(`Failed to get export formats: ${err.message}`);
    }
  }, [formatsAPI]);

  /**
   * Export to DOCX (Word document)
   */
  const exportToDOCX = useCallback(
    async (dpt, bpmn, kpis, gargalos, filename = 'ceproc_relatorio.docx') => {
      if (!dpt) {
        throw new Error('DPT data is required for DOCX export');
      }

      const payload = {
        dpt,
        bpmn: bpmn || null,
        kpis: kpis || [],
        gargalos: gargalos || null,
        filename,
      };

      try {
        const result = await docxAPI.execute(payload);
        const exportEntry = {
          id: `docx_${Date.now()}`,
          format: 'DOCX',
          filename: filename || 'relatorio.docx',
          timestamp: new Date(),
          size: result.file_size || null,
          downloadUrl: result.download_url || null,
        };
        setExportHistory((prev) => [exportEntry, ...prev]);
        return result;
      } catch (err) {
        console.error('DOCX export failed:', err);
        throw new Error(`DOCX export failed: ${err.message}`);
      }
    },
    [docxAPI]
  );

  /**
   * Export to XLSX (Excel spreadsheet)
   */
  const exportToXLSX = useCallback(
    async (kpis, processName = 'Análise de Processo', filename = 'kpis.xlsx') => {
      if (!kpis || kpis.length === 0) {
        throw new Error('KPI data is required for XLSX export');
      }

      const payload = {
        kpis,
        process_name: processName,
        filename,
      };

      try {
        const result = await xlsxAPI.execute(payload);
        const exportEntry = {
          id: `xlsx_${Date.now()}`,
          format: 'XLSX',
          filename: filename || 'kpis.xlsx',
          timestamp: new Date(),
          size: result.file_size || null,
          downloadUrl: result.download_url || null,
        };
        setExportHistory((prev) => [exportEntry, ...prev]);
        return result;
      } catch (err) {
        console.error('XLSX export failed:', err);
        throw new Error(`XLSX export failed: ${err.message}`);
      }
    },
    [xlsxAPI]
  );

  /**
   * Export to BPMN XML
   */
  const exportToBPMN = useCallback(
    async (bpmn, filename = 'processo.bpmn') => {
      if (!bpmn) {
        throw new Error('BPMN data is required for BPMN export');
      }

      const payload = {
        bpmn,
        filename,
      };

      try {
        const result = await bpmnAPI.execute(payload);
        const exportEntry = {
          id: `bpmn_${Date.now()}`,
          format: 'BPMN',
          filename: filename || 'processo.bpmn',
          timestamp: new Date(),
          size: result.file_size || null,
          downloadUrl: result.download_url || null,
        };
        setExportHistory((prev) => [exportEntry, ...prev]);
        return result;
      } catch (err) {
        console.error('BPMN export failed:', err);
        throw new Error(`BPMN export failed: ${err.message}`);
      }
    },
    [bpmnAPI]
  );

  /**
   * Export all formats as ZIP
   */
  const exportToZIP = useCallback(
    async (dpt, bpmn, kpis, gargalos, filename = 'ceproc_analise.zip') => {
      if (!dpt) {
        throw new Error('DPT data is required for ZIP export');
      }

      const payload = {
        dpt,
        bpmn: bpmn || null,
        kpis: kpis || [],
        gargalos: gargalos || null,
        filename,
        include_formats: selectedFormats,
      };

      try {
        const result = await zipAPI.execute(payload);
        const exportEntry = {
          id: `zip_${Date.now()}`,
          format: 'ZIP',
          filename: filename || 'ceproc_analise.zip',
          timestamp: new Date(),
          size: result.file_size || null,
          downloadUrl: result.download_url || null,
          includedFormats: selectedFormats,
        };
        setExportHistory((prev) => [exportEntry, ...prev]);
        return result;
      } catch (err) {
        console.error('ZIP export failed:', err);
        throw new Error(`ZIP export failed: ${err.message}`);
      }
    },
    [selectedFormats, zipAPI]
  );

  /**
   * Download a file from URL
   */
  const downloadFile = useCallback((url, filename) => {
    if (!url) {
      throw new Error('No URL provided for download');
    }

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      throw new Error(`Download failed: ${err.message}`);
    }
  }, []);

  /**
   * Toggle format selection for ZIP export
   */
  const toggleFormat = useCallback((format) => {
    setSelectedFormats((prev) => ({
      ...prev,
      [format]: !prev[format],
    }));
  }, []);

  /**
   * Select all formats
   */
  const selectAllFormats = useCallback(() => {
    setSelectedFormats({
      docx: true,
      xlsx: true,
      bpmn: true,
      zip: false, // Don't include ZIP inside ZIP
    });
  }, []);

  /**
   * Deselect all formats
   */
  const deselectAllFormats = useCallback(() => {
    setSelectedFormats({
      docx: false,
      xlsx: false,
      bpmn: false,
      zip: false,
    });
  }, []);

  /**
   * Get summary of selected formats
   */
  const getSelectedFormatsCount = useCallback(() => {
    return Object.values(selectedFormats).filter(Boolean).length;
  }, [selectedFormats]);

  /**
   * Get export history entry
   */
  const getExportHistoryEntry = useCallback((exportId) => {
    return exportHistory.find((entry) => entry.id === exportId);
  }, [exportHistory]);

  /**
   * Clear export history
   */
  const clearExportHistory = useCallback(() => {
    setExportHistory([]);
  }, []);

  /**
   * Remove specific export from history
   */
  const removeFromHistory = useCallback((exportId) => {
    setExportHistory((prev) => prev.filter((entry) => entry.id !== exportId));
  }, []);

  /**
   * Get export format by ID
   */
  const getFormatInfo = useCallback((format) => {
    const formats = {
      docx: {
        name: 'Word Document',
        extension: '.docx',
        description: 'Complete process analysis report',
        icon: '📄',
      },
      xlsx: {
        name: 'Excel Spreadsheet',
        extension: '.xlsx',
        description: '16-column KPI indicators table',
        icon: '📊',
      },
      bpmn: {
        name: 'BPMN Diagram',
        extension: '.bpmn',
        description: 'BPMN 2.0 XML process diagram',
        icon: '📐',
      },
      zip: {
        name: 'Complete Archive',
        extension: '.zip',
        description: 'All selected formats in one file',
        icon: '📦',
      },
    };
    return formats[format] || null;
  }, []);

  return {
    // State
    exportHistory,
    selectedFormats,
    loading: docxAPI.loading || xlsxAPI.loading || bpmnAPI.loading || zipAPI.loading,
    error: docxAPI.error || xlsxAPI.error || bpmnAPI.error || zipAPI.error,

    // Methods
    getAvailableFormats,
    exportToDOCX,
    exportToXLSX,
    exportToBPMN,
    exportToZIP,
    downloadFile,
    toggleFormat,
    selectAllFormats,
    deselectAllFormats,
    getSelectedFormatsCount,
    getExportHistoryEntry,
    clearExportHistory,
    removeFromHistory,
    getFormatInfo,
  };
};
