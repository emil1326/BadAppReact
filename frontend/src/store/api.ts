import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { resetAuth, setAuth } from './slices/authSlice';
import { resetFlow, setFlow } from './slices/flowSlice';
import type { SidebarSection } from '../types/sidebar';
import type { AdminMessage } from '../types/message';
import type { WelcomeData } from '../types/welcome';
import type { Job } from '../types/job';

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
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    login: builder.mutation<
      { sessionId: string; userName: string },
      { userName: string }
    >({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setAuth({ sessionId: data.sessionId, userName: data.userName }));
      },
    }),

    logout: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(resetAuth());
        }
      },
    }),

    getMe: builder.query<{ userName: string }, void>({
      query: () => '/api/me',
      providesTags: ['Me'],
    }),

    getSidebar: builder.query<SidebarSection[], void>({
      query: () => '/data/sidebar.json',
    }),

    getMessages: builder.query<AdminMessage[], void>({
      query: () => '/data/messages.json',
    }),

    getWelcome: builder.query<WelcomeData, void>({
      query: () => '/data/welcome.json',
    }),

    getJobs: builder.query<Job[], void>({
      query: () => '/data/jobs.json',
    }),

    startBourseFlow: builder.mutation<{ endTime: number; code: string }, void>({
      query: () => ({ url: '/api/session/start-bourse-flow', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setFlow({ endTime: data.endTime }));
      },
    }),

    checkTimer: builder.mutation<{ ok: true; remainingMs: number }, { code: string }>({
      query: (body) => ({
        url: '/api/session/check-timer',
        method: 'POST',
        body,
      }),
    }),

    regenerateCode: builder.mutation<{ code: string }, void>({
      query: () => ({ url: '/api/session/regenerate-code', method: 'POST' }),
    }),

    recoverSession: builder.query<
      { active: boolean; endTime: number | null; expired: boolean },
      void
    >({
      query: () => '/api/session/recover',
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.active && data.endTime !== null) {
          dispatch(setFlow({ endTime: data.endTime }));
        } else {
          dispatch(resetFlow());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetSidebarQuery,
  useGetMessagesQuery,
  useGetWelcomeQuery,
  useGetJobsQuery,
  useStartBourseFlowMutation,
  useCheckTimerMutation,
  useRegenerateCodeMutation,
  useRecoverSessionQuery,
} = api;
