import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const API_BASE_URL = 'http://localhost:3001';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const sessionId = (getState() as RootState).auth.sessionId;
      if (sessionId) {
        headers.set('X-Session-Id', sessionId);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
