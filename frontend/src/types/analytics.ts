// types/analytics.ts
export interface QueueMetrics {
    id: number;
    queue: number;
    queue_name: string;
    date: string;
    average_wait_time: string;
    total_customers: number;
    served_customers: number;
    abandoned_customers: number;
    peak_hours: string[];
    service_efficiency: number;
    service_efficiency_percentage: number;
    created_at: string;
  }
  
  export interface AgentPerformance {
    id: number;
    agent: number;
    agent_name: string;
    agent_email: string;
    date: string;
    customers_served: number;
    average_service_time: string;
    service_rating: number | null;
    created_at: string;
  }
  
  export interface CustomerFeedback {
    id: number;
    ticket: number;
    ticket_number: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    wait_time_satisfaction: 1 | 2 | 3 | 4 | 5;
    service_satisfaction: 1 | 2 | 3 | 4 | 5;
    average_rating: number;
    created_at: string;
  }
  
  export interface MetricsAggregate {
    date_from: string;
    date_to: string;
    aggregate_by: 'day' | 'week' | 'month';
  }
  
  export interface PerformanceAggregate extends MetricsAggregate {
    metrics: ('customers_served' | 'average_service_time' | 'service_rating')[];
  }
  
  export interface FeedbackAnalysis extends MetricsAggregate {
    group_by: 'rating' | 'wait_time_satisfaction' | 'service_satisfaction';
    include_comments: boolean;
  }