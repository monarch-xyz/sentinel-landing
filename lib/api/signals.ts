import { createApiClient } from '@/lib/api/client';
import { Signal, SignalListResponse, SignalLogsResponse } from '@/lib/types/signal';

const client = createApiClient({ baseUrl: '' });

export const listSignals = () => client.get<SignalListResponse>('/api/sentinel/signals');

export const getSignal = (id: string) => client.get<Signal>(`/api/sentinel/signals/${id}`);

export const createSignal = (payload: Signal) => client.post<Signal, Signal>('/api/sentinel/signals', payload);

export const updateSignal = (id: string, payload: Partial<Signal>) =>
  client.patch<Signal, Partial<Signal>>(`/api/sentinel/signals/${id}`, payload);

export const deleteSignal = (id: string) => client.del<void>(`/api/sentinel/signals/${id}`);

export const simulateSignal = (id: string) => client.post<Record<string, unknown>, Record<string, unknown>>(`/api/sentinel/signals/${id}/simulate`, {});

export const getSignalLogs = (id: string) => client.get<SignalLogsResponse>(`/api/sentinel/signals/${id}/logs`);

export const getSignalHistory = (id: string) =>
  client.get<Record<string, unknown>>(`/api/sentinel/signals/${id}/history`);
