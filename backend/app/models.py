from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============= TRANSCRIPTION =============
class TranscriptionRequest(BaseModel):
    """Audio transcription request"""
    mode: str = Field(..., description="'audio' or 'text'")
    text: Optional[str] = None
    audio_duration_seconds: Optional[float] = None


class TranscriptionResponse(BaseModel):
    """Transcription response"""
    transcription: str
    duration_seconds: Optional[float]
    confidence: float
    timestamp: datetime


# ============= DPT (Descrição do Processo de Trabalho) =============
class MetadadosDPT(BaseModel):
    nome_processo: str
    nome_unidade: str
    elaborado_por: Optional[str] = None
    descricao: Optional[str] = None
    versao: str = Field(default_factory=lambda: "v1")


class ItemLista(BaseModel):
    descricao: str
    detalhe: Optional[str] = None


class EtapaPrincipal(BaseModel):
    id: Optional[str] = None
    etapa: str
    descricao: Optional[str] = None
    responsavel: str
    tempo_estimado: Optional[str] = None
    criticidade: Optional[str] = "Média"


class ConcetoDefinicao(BaseModel):
    termo: str
    definicao: str


class SessaoComLista(BaseModel):
    descricao: Optional[str] = None
    lista: List[str] = []


class DocumentosIndicadores(BaseModel):
    documentos: SessaoComLista = Field(default_factory=SessaoComLista)
    indicadores: SessaoComLista = Field(default_factory=SessaoComLista)


class DPTSchema(BaseModel):
    """Complete DPT JSON Schema"""
    metadados: MetadadosDPT

    negocio: SessaoComLista = Field(default_factory=SessaoComLista)
    finalidade: SessaoComLista = Field(default_factory=SessaoComLista)
    conceitos_e_definicoes: List[ConcetoDefinicao] = []

    clientes: SessaoComLista = Field(default_factory=SessaoComLista)
    normas_reguladoras: SessaoComLista = Field(default_factory=SessaoComLista)

    descricoes_de_entrada: SessaoComLista = Field(default_factory=SessaoComLista)
    principais_etapas: List[EtapaPrincipal] = []
    descricoes_de_saida: SessaoComLista = Field(default_factory=SessaoComLista)

    atores: SessaoComLista = Field(default_factory=SessaoComLista)
    sistemas_e_infraestrutura: SessaoComLista = Field(default_factory=SessaoComLista)

    expectativa_de_melhoria: SessaoComLista = Field(default_factory=SessaoComLista)
    documentos_e_indicadores: DocumentosIndicadores = Field(default_factory=DocumentosIndicadores)
    pontos_sensiveis: SessaoComLista = Field(default_factory=SessaoComLista)

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class DPTRequest(BaseModel):
    transcription: str
    edit_instructions: Optional[str] = None


class DPTResponse(BaseModel):
    success: bool
    dpt_json: DPTSchema
    version: str = "v1"
    timestamp: datetime


# ============= BPMN =============
class Waypoint(BaseModel):
    x: float
    y: float


class Lane(BaseModel):
    id: str
    nome: str
    x: float
    y: float
    width: float
    height: float


class Event(BaseModel):
    id: str
    nome: str
    tipo: str = Field(..., description="'start' or 'end'")
    x: float
    y: float
    width: float = 40
    height: float = 40
    incoming: List[str] = []
    outgoing: List[str] = []


class Activity(BaseModel):
    id: str
    nome: str
    lane_id: str
    x: float
    y: float
    width: float = 100
    height: float = 80
    activity_type: str = "manual"
    incoming: List[str] = []
    outgoing: List[str] = []


class GatewayOutgoing(BaseModel):
    id: str
    label: str
    target: str


class Gateway(BaseModel):
    id: str
    nome: str
    lane_id: str
    x: float
    y: float
    width: float = 50
    height: float = 50
    incoming: List[str] = []
    outgoing: List[GatewayOutgoing] = []
    default_flow: Optional[str] = None


class SequenceFlow(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    waypoints: List[Waypoint] = []
    inter_lane_transition: bool = False
    passes_through_lanes: List[str] = []


class DataObject(BaseModel):
    id: str
    nome: str
    x: float
    y: float
    width: float = 40
    height: float = 40


class BPMNMetadata(BaseModel):
    processo: str
    versao: str
    unidade: str
    autor: Optional[str] = None
    descricao: Optional[str] = None


class BPMNJsonSchema(BaseModel):
    metadata: BPMNMetadata
    lanes: List[Lane]
    events: List[Event]
    activities: List[Activity]
    gateways: List[Gateway] = []
    sequence_flows: List[SequenceFlow]
    data_objects: List[DataObject] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class BPMNRequest(BaseModel):
    dpt_id: str
    dpt_json: DPTSchema


class BPMNResponse(BaseModel):
    success: bool
    bpmn_json: BPMNJsonSchema
    bpmn_xml: str
    version: str = "v1"
    timestamp: datetime


# ============= KPI =============
class KPISchema(BaseModel):
    """Key Performance Indicator Schema"""
    indicador: str
    objetivo: str
    processo: str
    subprocesso: Optional[str] = None
    produto_servico: Optional[str] = None
    cliente: str

    metadados: List[str] = []
    fonte_extracao: str

    formula_calculo: str
    unidade: str

    filtro: Optional[str] = None
    meta: str
    periodicidade: str
    polaridade: str  # "↑" ou "↓"

    responsavel: str
    criticidade: str  # "🔴 Alta", "🟡 Média", "🟢 Baixa"
    justificativa: Optional[str] = None


class KPIRequest(BaseModel):
    dpt_id: str
    dpt_json: DPTSchema


class KPIResponse(BaseModel):
    success: bool
    kpis: List[KPISchema]
    total_count: int
    alta_criticidade: int
    timestamp: datetime


# ============= GARGALOS (Análise) =============
class Gargalo(BaseModel):
    descricao: str
    impacto: str  # "Alto", "Médio", "Baixo"
    etapa_afetada: str
    causas: List[str] = []


class Melhoria(BaseModel):
    id: str
    descricao: str
    tipo: str  # "Automação", "Padronização", "Integração", etc.
    economia_estimada: Optional[str] = None
    aprovada: bool = False


class GargaloAnalysisResponse(BaseModel):
    success: bool
    gargalos: List[Gargalo]
    melhorias_propostas: List[Melhoria]
    resumo_executivo: str
    timestamp: datetime


# ============= ITERAÇÃO (Versioning) =============
class IteracaoItem(BaseModel):
    versao: str
    tipo: str  # "DPT", "BPMN", "Gargalos"
    timestamp: datetime
    descricao: Optional[str] = None


class IteracoesResponse(BaseModel):
    dpt_id: str
    iteracoes: List[IteracaoItem]
    versao_atual: str


# ============= EXPORT =============
class ExportRequest(BaseModel):
    dpt_id: str
    format: str  # "docx", "xlsx", "bpmn", "zip"
    version: Optional[str] = None


class ExportResponse(BaseModel):
    success: bool
    filename: str
    size_bytes: int
    timestamp: datetime


# ============= API Response Wrappers =============
class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    llm_connected: bool
    database_connected: bool
    timestamp: datetime
