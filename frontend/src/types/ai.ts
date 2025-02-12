export interface WaitTimePredictor {
  queueId: string;
  currentLength: number;
  historicalData: {
    timestamp: string;
    waitTime: number;
    queueLength: number;
    dayOfWeek: number;
    timeOfDay: string;
    isHoliday: boolean;
    weather?: string;
  }[];
  prediction: {
    estimatedWaitTime: number;
    confidence: number;
    factors: {
      factor: string;
      impact: number;
    }[];
  };
}

export interface ResourceAllocation {
  servicePointId: string;
  currentLoad: number;
  efficiency: number;
  specializations: string[];
  suggestions: {
    action: 'add' | 'remove' | 'reassign';
    priority: 'high' | 'medium' | 'low';
    reason: string;
    expectedImpact: {
      waitTimeReduction: number;
      efficiencyGain: number;
    };
  }[];
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    queueId?: string;
    ticketId?: string;
    intent?: string;
    confidence?: number;
  };
}

export interface ChatbotSession {
  id: string;
  userId: string;
  messages: ChatbotMessage[];
  status: 'active' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
  metadata: {
    userLanguage: string;
    browserInfo: string;
    escalationReason?: string;
  };
}

export interface QueueAnomaly {
  id: string;
  queueId: string;
  type: 'wait_time' | 'abandonment' | 'service_time' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  description: string;
  metrics: {
    observed: number;
    expected: number;
    deviation: number;
  };
  context: {
    historicalPattern: string;
    relatedEvents?: string[];
    possibleCauses: string[];
  };
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: {
    action: string;
    timestamp: string;
    effectivenessScore: number;
  };
}
