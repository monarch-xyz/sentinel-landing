import { createApiClient } from '@/lib/api/client';

const client = createApiClient({ baseUrl: '' });

export interface SchemaListResponse {
  items: string[];
}

export const listEventTypes = () => client.get<SchemaListResponse>('/api/sentinel/schema/events');

export const listEntityTypes = () => client.get<SchemaListResponse>('/api/sentinel/schema/entities');
