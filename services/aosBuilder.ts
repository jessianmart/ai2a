import {
  AOSOrganization, Department, AgentSwarm, AgentConfig, SkillConfig, ToolConfig,
  MemoryConfig, MoEChamber, KPIConfig, EscalationTrigger,
  AgentArchetype, AutonomyLevel, MemoryType, ToolInterface,
  CommunicationProtocol, HumanRole, DepartmentType,
} from '../types';

// ============================================================================
// AOS Builder — Generates complete organizational structures
// ============================================================================

const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// --- KPI Templates ---

export const defaultKPIs = (criticality: 'critical' | 'standard' | 'low' = 'standard'): KPIConfig => ({
  model_confidence: {
    target: criticality === 'critical' ? 0.95 : 0.90,
    alert_below: criticality === 'critical' ? 0.85 : 0.75,
  },
  mttr_seconds: {
    target: criticality === 'critical' ? 120 : 300,
    alert_above: criticality === 'critical' ? 300 : 600,
  },
  token_cost_per_result: {
    currency: 'USD',
    target_usd: criticality === 'critical' ? 0.02 : 0.05,
    alert_above_usd: criticality === 'critical' ? 0.10 : 0.20,
  },
  hallucination_rate: {
    target: criticality === 'critical' ? 0.01 : 0.02,
    alert_above: criticality === 'critical' ? 0.02 : 0.05,
  },
  custom_kpis: [],
});

// --- Escalation Trigger Templates ---

export const defaultEscalationTriggers = (humanOwner: HumanRole): EscalationTrigger[] => [
  {
    type: 'irreversible_action',
    description: 'Ação financeira ou deleção de dados acima do limite configurado',
    condition: 'financial_transaction > $10,000 OR critical_data_deletion == true',
    escalates_to: humanOwner,
    action: 'Pausar execução, notificar humano via Slack/email com contexto completo',
    timeout_minutes: 15,
    fallback_action: 'Manter tarefa em fila e renotificar a cada 15min até resposta',
  },
  {
    type: 'policy_conflict',
    description: 'Duas diretrizes organizacionais se contradizem durante execução',
    condition: 'policy_conflict_detected == true AND resolution_confidence < 0.7',
    escalates_to: HumanRole.CAIO,
    action: 'Apresentar ambas as políticas conflitantes ao humano com análise de impacto',
    timeout_minutes: 30,
    fallback_action: 'Aplicar política mais restritiva e registrar conflito para revisão',
  },
  {
    type: 'acute_negative_sentiment',
    description: 'Frustração extrema do cliente que requer empatia e julgamento humano',
    condition: 'sentiment_score < -0.8 AND topic == "complaint" AND escalation_requested == true',
    escalates_to: humanOwner,
    action: 'Notificar humano imediatamente com histórico completo do cliente',
    timeout_minutes: 5,
    fallback_action: 'Escalar para AI Champion e enviar mensagem de espera ao cliente',
  },
  {
    type: 'low_confidence',
    description: 'Agente abaixo do threshold mínimo de confiança para a tarefa',
    condition: 'model_confidence < confidence_threshold AND task_criticality == "high"',
    escalates_to: humanOwner,
    action: 'Pausar tarefa, solicitar revisão humana com contexto e resultado parcial',
    timeout_minutes: 20,
    fallback_action: 'Marcar tarefa como "requires_review" e continuar com tarefas não-críticas',
  },
];

// --- MoE Chamber Builder ---

export const buildMoEChamber = (
  departmentName: string,
  executorId: string,
  validatorId: string,
  criticId: string,
  expertIds: string[],
): MoEChamber => ({
  id: uid('chamber'),
  name: `${departmentName} Neural Chamber`,
  mission: `Garantir execução de alta qualidade e zero alucinações em operações críticas do departamento ${departmentName}`,
  experts: expertIds,
  router: {
    strategy: 'confidence_based',
    top_k: 2,
  },
  anti_hallucination_triad: {
    executor: executorId,
    validator: validatorId,
    critic: criticId,
  },
});

// --- Agent Builder ---

export const buildAgent = (
  name: string,
  mission: string,
  specialization: string,
  archetype: AgentArchetype,
  autonomy: AutonomyLevel,
  parentId: string | null,
  tools: string[],
  skills: string[],
  extraTags: string[] = [],
): AgentConfig => ({
  id: uid('agent'),
  name,
  version: '1.0.0',
  mission,
  dna: {
    archetype,
    tone: archetype === AgentArchetype.CRITIC
      ? 'Analítico, cético e rigoroso — questiona tudo'
      : archetype === AgentArchetype.VALIDATOR
      ? 'Preciso, sistemático e orientado a evidências'
      : archetype === AgentArchetype.MANAGER
      ? 'Estratégico, claro e orientado a resultados'
      : 'Especializado, eficiente e focado no domínio',
    autonomy,
    confidence_threshold: archetype === AgentArchetype.CRITIC ? 0.95 : 0.85,
    reasoning_style: archetype === AgentArchetype.CRITIC
      ? 'tree_of_thought'
      : archetype === AgentArchetype.MANAGER
      ? 'reflexion'
      : 'chain_of_thought',
  },
  specialization,
  hierarchy: {
    parent: parentId,
    sub_agents: [],
    peers: [],
    communication: CommunicationProtocol.A2A,
  },
  tools,
  skills,
  memory_strategy: [MemoryType.EPISODIC, MemoryType.PROCEDURAL],
  guardrails: {
    max_iterations: archetype === AgentArchetype.MANAGER ? 20 : 10,
    timeout_seconds: 300,
    forbidden_actions: ['delete_without_backup', 'bypass_validation', 'skip_audit_log'],
    escalation_rules: [
      `Se confiança < 0.75, escalar para agente manager`,
      `Se max_iterations atingido, reportar estado parcial e escalar`,
    ],
    anti_hallucination: true,
  },
  system_prompt: `[IDENTIDADE]\nVocê é ${name}. Missão North Star: ${mission}\n\n[ESPECIALIZAÇÃO]\n${specialization}\n\n[GUARDRAILS]\n- Confiança mínima: 0.85\n- Sempre valide outputs com o Validador antes de reportar\n- Jamais tome ações irreversíveis sem aprovação\n- Registre cada passo em memória procedural`,
  created_at: Date.now(),
  tags: ['aos', ...extraTags],
});

// --- Department Memory Builder ---

export const buildDepartmentMemory = (deptName: string): MemoryConfig[] => [
  {
    id: uid('memory'),
    name: `${deptName} — Episodic Buffer`,
    type: MemoryType.EPISODIC,
    description: `Histórico de conversas e ações recentes do departamento ${deptName}`,
    strategy: {
      storage: 'in_memory',
      ttl_seconds: 7200,
      max_entries: 500,
      indexing: 'sequential',
      retrieval: 'recency',
    },
    schema: { session_id: 'string', agent_id: 'string', action: 'string', result: 'string', timestamp: 'number' },
    access_control: { readable_by: [], writable_by: [], shared: true },
    created_at: Date.now(),
    tags: ['episodic', deptName.toLowerCase()],
  },
  {
    id: uid('memory'),
    name: `${deptName} — Knowledge Base`,
    type: MemoryType.SEMANTIC,
    description: `Base de conhecimento semântica do departamento — regras, políticas, histórico de decisões`,
    strategy: {
      storage: 'vector_db',
      ttl_seconds: null,
      max_entries: 10000,
      indexing: 'embedding',
      retrieval: 'relevance',
    },
    schema: { content: 'string', embedding: 'vector', source: 'string', confidence: 'number', created_at: 'number' },
    access_control: { readable_by: [], writable_by: [], shared: false },
    created_at: Date.now(),
    tags: ['semantic', deptName.toLowerCase()],
  },
  {
    id: uid('memory'),
    name: `${deptName} — Workflow Registry`,
    type: MemoryType.PROCEDURAL,
    description: `Workflows bem-sucedidos e padrões de execução do departamento ${deptName}`,
    strategy: {
      storage: 'graph_db',
      ttl_seconds: null,
      max_entries: 1000,
      indexing: 'keyword',
      retrieval: 'importance',
    },
    schema: { workflow_id: 'string', steps: 'array', success_rate: 'number', last_used: 'number' },
    access_control: { readable_by: [], writable_by: [], shared: true },
    created_at: Date.now(),
    tags: ['procedural', deptName.toLowerCase()],
  },
];

// ============================================================================
// Swarm Builders — One per canonical AOS department
// ============================================================================

export const buildStrategyGrowthSwarms = (): AgentSwarm[] => {
  // Swarm 1: Growth Strategist
  const growthManager = buildAgent(
    'Growth Strategist Agent',
    'Identificar segmentos de alta tração e converter insights de mercado em briefs de campanha prontos para execução',
    'Estratégia de crescimento, segmentação de mercado, pricing dinâmico e arquitetura de campanhas',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_crm_api', 'tool_analytics', 'tool_search_api'], ['skill_market_signal_scraper', 'skill_campaign_brief_generator'],
    ['strategy', 'growth'],
  );
  const marketAnalyst = buildAgent('Market Analyst', 'Analisar sinais de mercado e identificar oportunidades emergentes',
    'Análise de mercado, segmentação e inteligência competitiva',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, growthManager.id,
    ['tool_search_api', 'tool_analytics'], ['skill_market_signal_scraper'], ['specialist']);
  const pricingOptimizer = buildAgent('Pricing Optimizer', 'Calcular e recomendar estratégias de preço ótimas baseadas em dados de mercado',
    'Modelos de pricing dinâmico, elasticidade de demanda, análise competitiva de preços',
    AgentArchetype.SPECIALIST, AutonomyLevel.SUPERVISED, growthManager.id,
    ['tool_analytics', 'tool_crm_api'], ['skill_pricing_model'], ['specialist']);
  const campaignArchitect = buildAgent('Campaign Architect', 'Projetar estruturas de campanha multi-canal baseadas em briefs estratégicos',
    'Arquitetura de campanhas digitais, copy framework, sequência de touchpoints',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, growthManager.id,
    ['tool_crm_api', 'tool_email_sender'], ['skill_campaign_brief_generator'], ['specialist']);

  const swarm1Executor = marketAnalyst;
  const swarm1Validator = buildAgent('Growth Validator', 'Verificar consistência e precisão de análises de crescimento',
    'Validação de dados de mercado, fact-checking de insights', AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, growthManager.id,
    ['tool_analytics'], ['skill_data_validation'], ['validator']);
  const swarm1Critic = buildAgent('Growth Critic', 'Auditar estratégias de crescimento buscando falhas, vieses e inconsistências',
    'Auditoria crítica de estratégias, análise de risco, devil\'s advocate', AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, growthManager.id,
    ['tool_analytics'], [], ['critic']);

  growthManager.hierarchy.sub_agents = [marketAnalyst.id, pricingOptimizer.id, campaignArchitect.id, swarm1Validator.id, swarm1Critic.id];

  const swarm1: AgentSwarm = {
    id: uid('swarm'),
    name: 'Growth Intelligence Swarm',
    mission: 'Converter sinais de mercado em estratégias de crescimento acionáveis',
    department: DepartmentType.STRATEGY_GROWTH,
    manager_agent: growthManager,
    specialist_agents: [marketAnalyst, pricingOptimizer, campaignArchitect, swarm1Validator, swarm1Critic],
    moe_chamber: buildMoEChamber('Growth', swarm1Executor.id, swarm1Validator.id, swarm1Critic.id,
      [marketAnalyst.id, pricingOptimizer.id, campaignArchitect.id]),
    skills: ['skill_market_signal_scraper', 'skill_campaign_brief_generator', 'skill_pricing_model'],
    tools: ['tool_crm_api', 'tool_analytics', 'tool_search_api', 'tool_email_sender'],
    shared_memory: [],
    kpis: defaultKPIs('standard'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  // Swarm 2: Lead Qualification
  const leadManager = buildAgent('Lead Qualification Manager', 'Qualificar leads de alta intenção com 90%+ de precisão eliminando ciclos de venda desperdiçados',
    'Qualificação de leads B2B, scoring de intenção, enriquecimento de dados de conta',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_crm_api', 'tool_email_analyzer'], ['skill_intent_scoring'], ['lead', 'qualification']);
  const signalMonitor = buildAgent('Signal Monitor', 'Monitorar comportamentos digitais e sinais de intenção de compra em tempo real',
    'Web analytics, behavioral tracking, intent signal detection',
    AgentArchetype.MONITOR, AutonomyLevel.FULL, leadManager.id,
    ['tool_analytics', 'tool_search_api'], ['skill_behavioral_tracking'], ['monitor']);
  const intentScorer = buildAgent('Intent Scorer', 'Calcular score de intenção de compra multi-dimensional para cada lead',
    'Modelos preditivos de intenção, análise de dados comportamentais, scoring probabilístico',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, leadManager.id,
    ['tool_crm_api', 'tool_analytics'], ['skill_intent_scoring'], ['specialist']);
  const accountEnricher = buildAgent('Account Enricher', 'Enriquecer perfis de contas com dados de terceiros e inteligência de mercado',
    'Data enrichment, firmographic data, technographic signals',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, leadManager.id,
    ['tool_search_api', 'tool_crm_api'], ['skill_account_enrichment'], ['specialist']);
  const leadValidator = buildAgent('Lead Validator', 'Validar qualidade e integridade dos dados de leads antes do handoff para vendas',
    'Data quality, deduplication, GDPR compliance check',
    AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, leadManager.id,
    ['tool_crm_api'], ['skill_data_validation'], ['validator']);
  const leadCritic = buildAgent('Lead Critic', 'Auditar criticamente os scores de qualificação buscando vieses e falsos positivos',
    'Auditoria de modelos de scoring, detecção de vieses, análise de edge cases',
    AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, leadManager.id,
    [], [], ['critic']);

  leadManager.hierarchy.sub_agents = [signalMonitor.id, intentScorer.id, accountEnricher.id, leadValidator.id, leadCritic.id];

  const swarm2: AgentSwarm = {
    id: uid('swarm'),
    name: 'Lead Qualification Swarm',
    mission: 'Qualificar leads de alta intenção eliminando ciclos de venda desperdiçados',
    department: DepartmentType.STRATEGY_GROWTH,
    manager_agent: leadManager,
    specialist_agents: [signalMonitor, intentScorer, accountEnricher, leadValidator, leadCritic],
    moe_chamber: buildMoEChamber('Lead Qualification', signalMonitor.id, leadValidator.id, leadCritic.id,
      [signalMonitor.id, intentScorer.id, accountEnricher.id]),
    skills: ['skill_intent_scoring', 'skill_behavioral_tracking', 'skill_account_enrichment'],
    tools: ['tool_crm_api', 'tool_analytics', 'tool_email_analyzer', 'tool_search_api'],
    shared_memory: [],
    kpis: defaultKPIs('standard'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  return [swarm1, swarm2];
};

export const buildFinanceFiscalSwarms = (): AgentSwarm[] => {
  // Swarm: Financial Controller
  const finController = buildAgent('Financial Controller', 'Executar reconciliações bancárias e consolidações multi-entidade em tempo real com zero erros',
    'Contabilidade automatizada, reconciliação bancária, consolidação financeira, análise de variância',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_erp_connector', 'tool_banking_api', 'tool_audit_logger'],
    ['skill_bank_reconciliation', 'skill_financial_consolidation'], ['finance', 'controller']);
  const reconciliationSpec = buildAgent('Reconciliation Specialist', 'Reconciliar automaticamente todas as transações bancárias com o ERP em tempo real',
    'Matching de transações, detecção de discrepâncias, conciliação multi-conta',
    AgentArchetype.EXECUTOR, AutonomyLevel.SUPERVISED, finController.id,
    ['tool_banking_api', 'tool_erp_connector'], ['skill_bank_reconciliation'], ['executor']);
  const consolidationEngine = buildAgent('Consolidation Engine', 'Consolidar demonstrações financeiras de múltiplas entidades eliminando transações intercompany',
    'Consolidação IFRS/GAAP, eliminações intercompany, conversão de moeda',
    AgentArchetype.EXECUTOR, AutonomyLevel.SUPERVISED, finController.id,
    ['tool_erp_connector'], ['skill_financial_consolidation'], ['executor']);
  const varianceAnalyst = buildAgent('Variance Analyst', 'Detectar e explicar desvios entre orçado e realizado identificando causas raiz',
    'Análise de variância, root cause analysis, budget vs actuals, forecasting',
    AgentArchetype.SPECIALIST, AutonomyLevel.SUPERVISED, finController.id,
    ['tool_erp_connector', 'tool_analytics'], ['skill_variance_analysis'], ['specialist']);
  const finValidator = buildAgent('Finance Validator', 'Verificar matemática, conformidade contábil e integridade de todos os relatórios financeiros',
    'Validação contábil, auditoria de cálculos, checklist de conformidade IFRS',
    AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, finController.id,
    ['tool_erp_connector', 'tool_audit_logger'], ['skill_accounting_validation'], ['validator']);
  const finCritic = buildAgent('Finance Critic', 'Auditar skepticamente todos os resultados financeiros buscando fraudes, erros e inconsistências',
    'Auditoria forense, detecção de anomalias financeiras, análise de red flags',
    AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, finController.id,
    ['tool_audit_logger'], [], ['critic']);

  finController.hierarchy.sub_agents = [reconciliationSpec.id, consolidationEngine.id, varianceAnalyst.id, finValidator.id, finCritic.id];

  const finSwarm: AgentSwarm = {
    id: uid('swarm'),
    name: 'Financial Controller Swarm',
    mission: 'Contabilidade em tempo real com zero erros e conformidade total',
    department: DepartmentType.FINANCE_FISCAL,
    manager_agent: finController,
    specialist_agents: [reconciliationSpec, consolidationEngine, varianceAnalyst, finValidator, finCritic],
    moe_chamber: buildMoEChamber('Financial', reconciliationSpec.id, finValidator.id, finCritic.id,
      [reconciliationSpec.id, consolidationEngine.id, varianceAnalyst.id]),
    skills: ['skill_bank_reconciliation', 'skill_financial_consolidation', 'skill_variance_analysis'],
    tools: ['tool_erp_connector', 'tool_banking_api', 'tool_audit_logger'],
    shared_memory: [],
    kpis: defaultKPIs('critical'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  // Swarm: Fiscal Compliance
  const fiscalManager = buildAgent('Fiscal Compliance Manager', 'Garantir conformidade fiscal automática 24/7 com logs auditáveis em todas as jurisdições',
    'Compliance fiscal, cálculo de impostos, monitoramento regulatório, gestão de obrigações acessórias',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_tax_authority_api', 'tool_audit_logger'],
    ['skill_tax_calculation', 'skill_regulatory_check'], ['fiscal', 'compliance']);
  const taxCalculator = buildAgent('Tax Calculator', 'Calcular impostos devidos em todas as jurisdições com precisão de 99.9%',
    'Tributação federal, estadual e municipal, regimes especiais, benefícios fiscais',
    AgentArchetype.EXECUTOR, AutonomyLevel.SUPERVISED, fiscalManager.id,
    ['tool_tax_authority_api', 'tool_erp_connector'], ['skill_tax_calculation'], ['executor']);
  const auditLogger = buildAgent('Audit Logger', 'Registrar cada operação fiscal em trilha de auditoria imutável e consultável',
    'Audit trail, immutable logging, compliance documentation, evidência de processo',
    AgentArchetype.MONITOR, AutonomyLevel.FULL, fiscalManager.id,
    ['tool_audit_logger'], ['skill_audit_logging'], ['monitor']);
  const regulatoryMonitor = buildAgent('Regulatory Monitor', 'Monitorar mudanças legislativas e avaliar impacto nos processos fiscais',
    'Legislação tributária, Diário Oficial, alertas regulatórios, análise de impacto',
    AgentArchetype.MONITOR, AutonomyLevel.FULL, fiscalManager.id,
    ['tool_search_api', 'tool_tax_authority_api'], ['skill_regulatory_monitoring'], ['monitor']);
  const fiscalValidator = buildAgent('Fiscal Validator', 'Validar cálculos fiscais contra legislação vigente antes do pagamento',
    'Validação cruzada fiscal, checklist de conformidade, revisão pré-submission',
    AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, fiscalManager.id,
    ['tool_tax_authority_api', 'tool_audit_logger'], [], ['validator']);
  const fiscalCritic = buildAgent('Fiscal Critic', 'Auditar criticamente toda a cadeia fiscal buscando riscos, exposições e oportunidades de economia',
    'Tax risk assessment, planejamento tributário defensivo, análise de red flags',
    AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, fiscalManager.id,
    ['tool_audit_logger'], [], ['critic']);

  fiscalManager.hierarchy.sub_agents = [taxCalculator.id, auditLogger.id, regulatoryMonitor.id, fiscalValidator.id, fiscalCritic.id];

  const fiscalSwarm: AgentSwarm = {
    id: uid('swarm'),
    name: 'Fiscal Compliance Swarm',
    mission: 'Conformidade fiscal automática 24/7 em todas as jurisdições',
    department: DepartmentType.FINANCE_FISCAL,
    manager_agent: fiscalManager,
    specialist_agents: [taxCalculator, auditLogger, regulatoryMonitor, fiscalValidator, fiscalCritic],
    moe_chamber: buildMoEChamber('Fiscal', taxCalculator.id, fiscalValidator.id, fiscalCritic.id,
      [taxCalculator.id, auditLogger.id, regulatoryMonitor.id]),
    skills: ['skill_tax_calculation', 'skill_regulatory_check', 'skill_audit_logging'],
    tools: ['tool_tax_authority_api', 'tool_erp_connector', 'tool_audit_logger'],
    shared_memory: [],
    kpis: defaultKPIs('critical'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  return [finSwarm, fiscalSwarm];
};

export const buildCRMCustomerSuccessSwarms = (): AgentSwarm[] => {
  // Swarm: CS Guardian
  const csManager = buildAgent('CS Guardian', 'Detectar churn silencioso e iniciar planos de retenção antes que o cliente abra um ticket',
    'Customer health scoring, churn prediction, sentiment analysis, proactive retention',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_crm_connector', 'tool_product_analytics', 'tool_notification_service'],
    ['skill_churn_prediction', 'skill_sentiment_analysis'], ['crm', 'cs', 'retention']);
  const churnPredictor = buildAgent('Churn Predictor', 'Calcular probabilidade de churn para cada cliente usando sinais comportamentais multi-dimensional',
    'Modelos preditivos de churn, behavioral signals, engagement scoring, NPS correlation',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, csManager.id,
    ['tool_crm_connector', 'tool_product_analytics'], ['skill_churn_prediction'], ['specialist']);
  const sentimentAnalyst = buildAgent('Sentiment Analyst', 'Analisar sentimento de todas as comunicações para detectar insatisfação silenciosa',
    'NLP sentiment analysis, tone detection, emotion classification, multi-language',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, csManager.id,
    ['tool_crm_connector', 'tool_support_platform_api'], ['skill_sentiment_analysis'], ['specialist']);
  const healthMonitor = buildAgent('Health Monitor', 'Monitorar continuamente métricas de saúde do cliente e engajamento com o produto',
    'Product adoption metrics, DAU/MAU, feature usage, time-to-value tracking',
    AgentArchetype.MONITOR, AutonomyLevel.FULL, csManager.id,
    ['tool_product_analytics', 'tool_crm_connector'], ['skill_health_scoring'], ['monitor']);
  const csValidator = buildAgent('CS Validator', 'Validar alertas de churn e planos de retenção antes da execução',
    'Verificação de alertas, validação de planos de retenção, quality gate para comunicações',
    AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, csManager.id,
    ['tool_crm_connector'], [], ['validator']);
  const csCritic = buildAgent('CS Critic', 'Auditar criticamente os modelos de churn e estratégias de retenção buscando vieses e melhorias',
    'Auditoria de modelos preditivos, detecção de vieses, análise de edge cases de CS',
    AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, csManager.id,
    [], [], ['critic']);

  csManager.hierarchy.sub_agents = [churnPredictor.id, sentimentAnalyst.id, healthMonitor.id, csValidator.id, csCritic.id];

  const csSwarm: AgentSwarm = {
    id: uid('swarm'),
    name: 'CS Guardian Swarm',
    mission: 'Eliminar churn silencioso com detecção proativa e retenção automatizada',
    department: DepartmentType.CRM_CS,
    manager_agent: csManager,
    specialist_agents: [churnPredictor, sentimentAnalyst, healthMonitor, csValidator, csCritic],
    moe_chamber: buildMoEChamber('CS Guardian', churnPredictor.id, csValidator.id, csCritic.id,
      [churnPredictor.id, sentimentAnalyst.id, healthMonitor.id]),
    skills: ['skill_churn_prediction', 'skill_sentiment_analysis', 'skill_health_scoring'],
    tools: ['tool_crm_connector', 'tool_product_analytics', 'tool_support_platform_api', 'tool_notification_service'],
    shared_memory: [],
    kpis: defaultKPIs('standard'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  // Swarm: Revenue Expansion
  const expansionManager = buildAgent('Revenue Expansion Agent', 'Identificar e executar oportunidades de upsell/cross-sell no momento exato de máxima receptividade',
    'Revenue expansion, upsell timing, personalized offers, expansion pipeline management',
    AgentArchetype.MANAGER, AutonomyLevel.SUPERVISED, null,
    ['tool_crm_connector', 'tool_product_analytics', 'tool_email_sender'],
    ['skill_opportunity_detection', 'skill_sequence_drafting'], ['revenue', 'expansion']);
  const opportunityDetector = buildAgent('Opportunity Detector', 'Identificar sinais de momento ideal para upsell baseado em padrões de adoção e crescimento',
    'Product usage patterns, expansion signals, readiness scoring, timing analysis',
    AgentArchetype.SPECIALIST, AutonomyLevel.FULL, expansionManager.id,
    ['tool_product_analytics', 'tool_crm_connector'], ['skill_opportunity_detection'], ['specialist']);
  const personalizedOfferer = buildAgent('Personalized Offerer', 'Criar ofertas de expansão altamente personalizadas baseadas no contexto do cliente',
    'Personalization engine, offer construction, value proposition tailoring, ROI calculation',
    AgentArchetype.SPECIALIST, AutonomyLevel.SUPERVISED, expansionManager.id,
    ['tool_crm_connector'], ['skill_offer_personalization'], ['specialist']);
  const sequenceDrafter = buildAgent('Sequence Drafter', 'Redigir sequências de comunicação de expansão otimizadas para conversão',
    'Sales email copywriting, follow-up sequences, A/B testing, tone optimization',
    AgentArchetype.SPECIALIST, AutonomyLevel.SUPERVISED, expansionManager.id,
    ['tool_email_sender', 'tool_crm_connector'], ['skill_sequence_drafting'], ['specialist']);
  const expValidator = buildAgent('Expansion Validator', 'Validar offers e sequências antes do envio para garantir relevância e precisão',
    'Offer validation, message quality check, GDPR compliance, brand voice verification',
    AgentArchetype.VALIDATOR, AutonomyLevel.REACTIVE, expansionManager.id,
    ['tool_crm_connector'], [], ['validator']);
  const expCritic = buildAgent('Expansion Critic', 'Auditar criticamente as estratégias de expansão buscando abordagens agressivas ou mal-calibradas',
    'Revenue ethics, aggressive sales detection, customer relationship impact analysis',
    AgentArchetype.CRITIC, AutonomyLevel.REACTIVE, expansionManager.id,
    [], [], ['critic']);

  expansionManager.hierarchy.sub_agents = [opportunityDetector.id, personalizedOfferer.id, sequenceDrafter.id, expValidator.id, expCritic.id];

  const expansionSwarm: AgentSwarm = {
    id: uid('swarm'),
    name: 'Revenue Expansion Swarm',
    mission: 'Maximizar Net Revenue Retention identificando e executando upsell no timing perfeito',
    department: DepartmentType.CRM_CS,
    manager_agent: expansionManager,
    specialist_agents: [opportunityDetector, personalizedOfferer, sequenceDrafter, expValidator, expCritic],
    moe_chamber: buildMoEChamber('Revenue Expansion', opportunityDetector.id, expValidator.id, expCritic.id,
      [opportunityDetector.id, personalizedOfferer.id, sequenceDrafter.id]),
    skills: ['skill_opportunity_detection', 'skill_offer_personalization', 'skill_sequence_drafting'],
    tools: ['tool_crm_connector', 'tool_product_analytics', 'tool_email_sender'],
    shared_memory: [],
    kpis: defaultKPIs('standard'),
    communication_protocol: CommunicationProtocol.A2A,
  };

  return [csSwarm, expansionSwarm];
};

// ============================================================================
// Department Builders
// ============================================================================

export const buildStrategyDepartment = (): Department => {
  const swarms = buildStrategyGrowthSwarms();
  const memory = buildDepartmentMemory('Strategy & Growth');
  return {
    id: uid('dept'),
    name: 'Strategy, Growth & Competitive Intelligence',
    type: DepartmentType.STRATEGY_GROWTH,
    mission: 'Conduzir o crescimento proativo da empresa através de sinais de mercado em tempo real, qualificação precisa de leads e inteligência competitiva contínua',
    human_owner: HumanRole.CAIO,
    swarms,
    department_memory: memory,
    escalation_triggers: defaultEscalationTriggers(HumanRole.CAIO),
    communication_topology: 'hierarchical',
    operates_24_7: true,
    created_at: Date.now(),
  };
};

export const buildFinanceDepartment = (): Department => {
  const swarms = buildFinanceFiscalSwarms();
  const memory = buildDepartmentMemory('Finance & Fiscal');
  return {
    id: uid('dept'),
    name: 'Finance, Fiscal & Administrative',
    type: DepartmentType.FINANCE_FISCAL,
    mission: 'Transformar gestão financeira em processo contínuo e autônomo mantendo conformidade total, auditoria permanente e eficiência máxima',
    human_owner: HumanRole.CFO,
    swarms,
    department_memory: memory,
    escalation_triggers: defaultEscalationTriggers(HumanRole.CFO),
    communication_topology: 'hierarchical',
    operates_24_7: true,
    created_at: Date.now(),
  };
};

export const buildCRMDepartment = (): Department => {
  const swarms = buildCRMCustomerSuccessSwarms();
  const memory = buildDepartmentMemory('CRM & Customer Success');
  return {
    id: uid('dept'),
    name: 'CRM & Customer Success',
    type: DepartmentType.CRM_CS,
    mission: 'Eliminar churn silencioso, maximizar NRR e transformar cada cliente em um caso de sucesso através de atenção proativa e personalizada 24/7',
    human_owner: HumanRole.AI_OWNER,
    swarms,
    department_memory: memory,
    escalation_triggers: defaultEscalationTriggers(HumanRole.AI_OWNER),
    communication_topology: 'hierarchical',
    operates_24_7: true,
    created_at: Date.now(),
  };
};

// ============================================================================
// Full Organization Builder
// ============================================================================

export const buildFullAOSOrganization = (name: string = 'AI-Native Startup', industry: string = 'SaaS B2B'): AOSOrganization => {
  const departments = [
    buildStrategyDepartment(),
    buildFinanceDepartment(),
    buildCRMDepartment(),
  ];

  return {
    id: uid('org'),
    name,
    vision: `Tornar ${name} uma organização AI-Native de referência, operando com times humanos enxutos amplificados por centenas de agentes especialistas que executam a visão estratégica com precisão cirúrgica`,
    industry,
    human_team: [
      {
        role: HumanRole.CEO,
        name: 'CEO',
        strategic_mandate: 'Definir a visão de longo prazo e garantir o alinhamento cultural com a mentalidade AI-first',
        core_competencies: ['Visão estratégica', 'Gestão de stakeholders', 'Liderança cultural', 'Tomada de decisão de alto impacto'],
        owned_departments: [],
        escalation_receiver: true,
      },
      {
        role: HumanRole.CAIO,
        name: 'CAIO',
        strategic_mandate: 'Responsável pela arquitetura técnica, governança ética e roteiro de adoção de IA em toda a organização',
        core_competencies: ['LLMs', 'NLP', 'RAG', 'MLOps', 'Conformidade ética', 'MAS/MoE Architecture'],
        owned_departments: [DepartmentType.STRATEGY_GROWTH, DepartmentType.PRODUCT_TECH],
        escalation_receiver: true,
      },
      {
        role: HumanRole.CFO,
        name: 'CFO',
        strategic_mandate: 'Transformar finanças em sistema autônomo e garantir eficiência dos custos de infraestrutura de IA',
        core_competencies: ['Gestão de riscos algorítmicos', 'ROI tecnológico', 'Regulamentações financeiras', 'Token cost optimization'],
        owned_departments: [DepartmentType.FINANCE_FISCAL],
        escalation_receiver: true,
      },
      {
        role: HumanRole.AI_OWNER,
        name: 'AI Owner',
        strategic_mandate: 'Atuar como GM da IA em áreas específicas, resolvendo gargalos de implementação e maximizando o impacto',
        core_competencies: ['Análise de ROI', 'Orquestração operacional', 'Pensamento crítico de negócio', 'Agent performance analysis'],
        owned_departments: [DepartmentType.CRM_CS, DepartmentType.OPERATIONS],
        escalation_receiver: true,
      },
      {
        role: HumanRole.AI_AGENT_BUILDER,
        name: 'AI Agent Builder',
        strategic_mandate: 'Projetar e construir agentes que automatizam fluxos complexos unindo negócio e execução técnica',
        core_competencies: ['Engenharia de prompts', 'Arquitetura de fluxos', 'Engenharia de contexto', 'APIs e MCP'],
        owned_departments: [],
        escalation_receiver: false,
      },
      {
        role: HumanRole.AI_CHAMPION,
        name: 'AI Champion',
        strategic_mandate: 'Promover alfabetização em IA nas equipes e identificar novos casos de uso de alto valor',
        core_competencies: ['Relacionamento interpessoal', 'Facilitação', 'Advocacia responsável da IA', 'Change management'],
        owned_departments: [],
        escalation_receiver: false,
      },
    ],
    departments,
    global_kpis: defaultKPIs('standard'),
    global_escalation_triggers: defaultEscalationTriggers(HumanRole.CEO),
    communication_backbone: CommunicationProtocol.A2A,
    anti_hallucination_policy: {
      enabled: true,
      applies_to: ['all'],
      min_validators: 1,
    },
    created_at: Date.now(),
    tags: [industry.toLowerCase().replace(/\s/g, '_'), 'ai-native', 'aos'],
  };
};

// Utility: extract all agent configs from a department
export const extractAgentsFromDepartment = (dept: Department): AgentConfig[] => {
  const agents: AgentConfig[] = [];
  for (const swarm of dept.swarms) {
    agents.push(swarm.manager_agent);
    agents.push(...swarm.specialist_agents);
  }
  return agents;
};

// Utility: count total agents in an organization
export const countOrganizationAgents = (org: AOSOrganization): number =>
  org.departments.reduce((total, dept) =>
    total + dept.swarms.reduce((s, swarm) => s + 1 + swarm.specialist_agents.length, 0), 0);
