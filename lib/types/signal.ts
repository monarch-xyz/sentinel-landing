export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface SignalFilter {
  field: string;
  op: FilterOperator;
  value: string | number | boolean | Array<string | number>;
}

export interface SignalScope {
  chains: number[];
  markets?: string[];
  addresses?: string[];
  protocol?: 'morpho' | 'all';
}

export interface TimeWindow {
  duration: string;
  lookback_blocks?: number;
}

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

export interface ThresholdCondition {
  type: 'threshold';
  metric: string;
  operator: ComparisonOperator;
  value: number;
  window?: TimeWindow;
  filters?: SignalFilter[];
  chain_id?: number;
  market_id?: string;
  address?: string;
}

export interface ChangeCondition {
  type: 'change';
  metric: string;
  direction: 'increase' | 'decrease' | 'any';
  by: { percent: number } | { absolute: number };
  window?: TimeWindow;
  chain_id?: number;
  market_id?: string;
  address?: string;
}

export interface GroupCondition {
  type: 'group';
  addresses: string[];
  window?: TimeWindow;
  logic?: 'AND' | 'OR';
  requirement: {
    count: number;
    of: number;
  };
  conditions: SignalCondition[];
}

export interface AggregateCondition {
  type: 'aggregate';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  metric: string;
  operator: ComparisonOperator;
  value: number;
  window?: TimeWindow;
  filters?: SignalFilter[];
  chain_id?: number;
  market_id?: string;
}

export type SignalCondition = ThresholdCondition | ChangeCondition | GroupCondition | AggregateCondition;

export interface SignalDefinition {
  scope: SignalScope;
  conditions: SignalCondition[];
  logic?: 'AND' | 'OR';
  window: TimeWindow;
}

export interface SignalRecord {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  definition: SignalDefinition;
  webhook_url: string;
  cooldown_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string | null;
  last_evaluated_at?: string | null;
}

export interface CreateSignalRequest {
  name: string;
  description?: string;
  definition: SignalDefinition;
  webhook_url: string;
  cooldown_minutes?: number;
}

export interface UpdateSignalRequest {
  name?: string;
  description?: string;
  definition?: SignalDefinition;
  webhook_url?: string;
  cooldown_minutes?: number;
  is_active?: boolean;
}

export interface SignalRunLogEntry {
  id: string;
  signal_id: string;
  evaluated_at: string;
  triggered: boolean;
  conclusive: boolean;
  in_cooldown: boolean;
  notification_attempted: boolean;
  notification_success?: boolean | null;
  webhook_status?: number | null;
  error_message?: string | null;
  evaluation_duration_ms?: number | null;
  delivery_duration_ms?: number | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface SignalNotificationLogEntry {
  id: string;
  signal_id: string;
  triggered_at: string;
  payload: Record<string, unknown>;
  webhook_status?: number | null;
  error_message?: string | null;
  retry_count: number;
  evaluation_duration_ms?: number | null;
  delivery_duration_ms?: number | null;
  created_at: string;
  delivered_at?: string | null;
}

export interface SignalHistoryResponse {
  signal_id: string;
  evaluations: SignalRunLogEntry[];
  notifications: SignalNotificationLogEntry[];
  count?: {
    evaluations: number;
    notifications: number;
  };
}

export type SignalLogsResponse = SignalHistoryResponse;
