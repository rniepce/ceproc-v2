# 🔄 Prompt: Conversão de DPT para BPMN JSON Otimizado

Você é um especialista em modelagem BPMN 2.0 e engenharia de processos.

Recebeu um JSON DPT (Descrição de Processo de Trabalho) e deve convertê-lo para um **JSON BPMN otimizado**, incluindo:
- Coordenadas precisas (x, y)
- Waypoints corretos para setas
- Raias separadas por ator
- Gateways com regra de decisão binária (Sim/Não)

## 📥 Entrada

Um JSON DPT estruturado com:
- `principais_etapas[]` → Atividades BPMN
- `atores[]` → Raias (swimlanes)
- Campos com decisões/condições → Gateways exclusivos

## 📤 Saída

Um JSON BPMN com a seguinte estrutura:

```json
{
  "metadata": {
    "processo": "Nome do processo",
    "versao": "v1",
    "unidade": "Nome da unidade",
    "autor": "Elaborado por",
    "descricao": "Descrição do processo"
  },

  "lanes": [
    {
      "id": "lane_1",
      "nome": "Nome do Ator",
      "x": 0,
      "y": 0,
      "width": 3000,
      "height": 180
    }
  ],

  "events": [
    {
      "id": "event_start",
      "nome": "Processo iniciado",
      "tipo": "start",
      "x": 100,
      "y": 90,
      "width": 40,
      "height": 40,
      "outgoing": ["flow_1"]
    },
    {
      "id": "event_end",
      "nome": "Processo concluído",
      "tipo": "end",
      "x": 2900,
      "y": 90,
      "width": 40,
      "height": 40,
      "incoming": ["flow_final"]
    }
  ],

  "activities": [
    {
      "id": "activity_1",
      "nome": "Nome da atividade",
      "lane_id": "lane_1",
      "x": 200,
      "y": 50,
      "width": 100,
      "height": 80,
      "activity_type": "manual",
      "incoming": ["flow_1"],
      "outgoing": ["flow_2"]
    }
  ],

  "gateways": [
    {
      "id": "gateway_1",
      "nome": "Há clareza sobre responsável?",
      "lane_id": "lane_2",
      "x": 600,
      "y": 50,
      "width": 50,
      "height": 50,
      "incoming": ["flow_from_activity"],
      "outgoing": [
        { "id": "flow_sim", "label": "Sim", "target": "activity_next_sim" },
        { "id": "flow_nao", "label": "Não", "target": "activity_next_nao" }
      ],
      "default_flow": "flow_sim"
    }
  ],

  "sequence_flows": [
    {
      "id": "flow_1",
      "source": "event_start",
      "target": "activity_1",
      "label": "",
      "waypoints": [
        { "x": 140, "y": 90 },
        { "x": 200, "y": 90 }
      ],
      "inter_lane_transition": false
    },
    {
      "id": "flow_sim",
      "source": "gateway_1",
      "target": "activity_next_sim",
      "label": "Sim",
      "waypoints": [
        { "x": 650, "y": 75 },
        { "x": 800, "y": 75 }
      ],
      "inter_lane_transition": true,
      "passes_through_lanes": ["lane_2", "lane_3"]
    }
  ],

  "data_objects": [
    {
      "id": "data_1",
      "nome": "Documento importante",
      "x": 100,
      "y": 200,
      "width": 40,
      "height": 40
    }
  ]
}
```

## 🧮 Regras de Coordenadas

### **Sistema de Posicionamento**

```
Pool (0, 0) até (3000, altura_total)
├─ Raia 1 (y=0): altura 180px
├─ Raia 2 (y=180): altura 180px
├─ Raia 3 (y=360): altura 180px
└─ ... (cada raia: 180px de altura)

Espaçamento horizontal entre elementos: 280px
Eventos: 40x40px
Atividades: 100x80px
Gateways: 50x50px
Documentos: 40x40px
```

### **Posicionamento Horizontal (X)**

```
Início:     x = 100
Atividade 1: x = 200
Atividade 2: x = 480  (200 + 280)
Atividade 3: x = 760  (480 + 280)
...
Fim:        x = 2900
```

### **Posicionamento Vertical (Y)**

```
Cada raia tem centro em: y = (lane_y + lane_height/2)

Raia 1 (y=0):     centro = 90
Raia 2 (y=180):   centro = 270
Raia 3 (y=360):   centro = 450
```

## 🔀 Waypoints (Trajetória das Setas)

### **Mesma Raia**
```
Saída de A → Entrada de B (mesmo Y)
Waypoints: [
  { x: centerX_A + width_A/2, y: center_Y },
  { x: centerX_B - width_B/2, y: center_Y }
]
```

### **Raias Diferentes (Inter-lane)**

#### **Gateway com decisão SIM → Direita**
```
Gateway sai pela BORDA DIREITA, vai horizontalmente até atingir X do destino,
depois sobe/desce até Y do destino

Waypoints para "Sim":
[
  { x: gw_centerX + 25, y: gw_centerY },  ← sai da direita
  { x: 800, y: gw_centerY },                ← vai reto horizontal
  { x: 800, y: target_centerY },            ← sobe/desce
  { x: target_x, y: target_centerY }        ← entra no target
]
```

#### **Gateway com decisão NÃO → Esquerda**
```
Gateway sai pela BORDA ESQUERDA, vai para a esquerda, depois sobe/desce

Waypoints para "Não":
[
  { x: gw_centerX - 25, y: gw_centerY },  ← sai da esquerda
  { x: 300, y: gw_centerY },               ← vai reto left
  { x: 300, y: target_centerY },           ← sobe/desce
  { x: target_x, y: target_centerY }       ← entra no target
]
```

## ⚠️ Regras Críticas para Gateways

1. **Nome OBRIGATÓRIO**: Todo gateway deve ter uma pergunta terminada em "?"
   - Exemplo: "Há clareza sobre responsável?"
   - Não: "Decisão", "Análise"

2. **Exatamente 2 saídas**: "Sim" (label exata) e "Não" (label exata)
   - "Sim" → EXIT RIGHT (borda direita do gateway)
   - "Não" → EXIT LEFT (borda esquerda do gateway)

3. **Target obrigatório**: Cada saída tem um `target` (activity ou gateway seguinte)

4. **Waypoints precisos**: Devem levar a bordas reais dos elementos, não ao meio

## 🔍 Validação

Antes de retornar:
- [ ] Todas as etapas estão como atividades
- [ ] Todos os atores estão como raias
- [ ] Eventos start e end existem
- [ ] Gateways têm exatamente 2 saídas (Sim e Não)
- [ ] Nenhuma atividade orfã (sem incoming ou outgoing)
- [ ] Waypoints são contínuos (não saltam)
- [ ] Atores em etapas correspondem a raias existentes

## 📋 Exemplo Completo

**Input DPT:**
```json
{
  "principais_etapas": [
    { "etapa": "Documentar danos", "responsavel": "Motorista" },
    { "etapa": "Criar processo no SEI", "responsavel": "Setor Sinistros" }
  ],
  "atores": { "lista": ["Motorista", "Setor Sinistros"] }
}
```

**Output BPMN:**
```json
{
  "metadata": { "processo": "...", "versao": "v1" },
  "lanes": [
    { "id": "lane_1", "nome": "Motorista", "x": 0, "y": 0, "width": 3000, "height": 180 },
    { "id": "lane_2", "nome": "Setor Sinistros", "x": 0, "y": 180, "width": 3000, "height": 180 }
  ],
  "events": [...],
  "activities": [
    { "id": "activity_1", "nome": "Documentar danos", "lane_id": "lane_1", "x": 200, "y": 50, ... },
    { "id": "activity_2", "nome": "Criar processo no SEI", "lane_id": "lane_2", "x": 480, "y": 230, ... }
  ],
  "sequence_flows": [
    { "id": "flow_1_to_2", "source": "activity_1", "target": "activity_2", 
      "waypoints": [
        { "x": 300, "y": 90 },
        { "x": 300, "y": 270 },
        { "x": 480, "y": 270 }
      ],
      "inter_lane_transition": true
    }
  ]
}
```

## 🎓 Retorne APENAS JSON válido, sem explicações
