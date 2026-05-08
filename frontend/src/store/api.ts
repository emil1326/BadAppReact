import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { resetAuth, setAuth } from './slices/authSlice';
import { setFlow, updateFlow } from './slices/flowSlice';
import { setProfile } from './slices/profileSlice';
import type { SidebarSection } from '../types/sidebar';
import type { AdminMessage } from '../types/message';
import type { WelcomeData } from '../types/welcome';
import type { Job } from '../types/job';
import type { Profile, ProfileMode } from '../types/profile';

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

    // Static JSON endpoints — data never changes within a session, so we
    // never want RTK Query to evict and re-fetch.
    getSidebar: builder.query<SidebarSection[], void>({
      query: () => '/data/sidebar.json',
      keepUnusedDataFor: Infinity,
    }),

    getMessages: builder.query<AdminMessage[], void>({
      query: () => '/data/messages.json',
      keepUnusedDataFor: Infinity,
    }),

    getWelcome: builder.query<WelcomeData, void>({
      query: () => '/data/welcome.json',
      keepUnusedDataFor: Infinity,
    }),

    getJobs: builder.query<Job[], void>({
      query: () => '/data/jobs.json',
      keepUnusedDataFor: Infinity,
    }),

    startBourseFlow: builder.mutation<
      { endTime: number; codeSvg: string },
      void
    >({
      query: () => ({ url: '/api/session/start-bourse-flow', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setFlow({ endTime: data.endTime, latestCodeSvg: data.codeSvg }));
      },
    }),

    checkTimer: builder.mutation<{ ok: true; remainingMs: number }, { code: string }>({
      query: (body) => ({
        url: '/api/session/check-timer',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Successful verification burns the code server-side; clear the
          // cached SVG so the UI reflects the same state.
          dispatch(updateFlow({ latestCodeSvg: null }));
        } catch {
          // Leave the cached code untouched on failure.
        }
      },
    }),

    getProfile: builder.query<Profile, void>({
      query: () => '/api/profile',
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setProfile(data));
      },
    }),

    setProfileMode: builder.mutation<Profile, { mode: ProfileMode }>({
      query: (body) => ({
        url: '/api/profile/mode',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setProfile(data));
      },
    }),

    regenerateCode: builder.mutation<{ codeSvg: string }, void>({
      query: () => ({ url: '/api/session/regenerate-code', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(updateFlow({ latestCodeSvg: data.codeSvg }));
      },
    }),

  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetSidebarQuery,
  useGetMessagesQuery,
  useGetWelcomeQuery,
  useGetJobsQuery,
  useGetProfileQuery,
  useSetProfileModeMutation,
  useStartBourseFlowMutation,
  useCheckTimerMutation,
  useRegenerateCodeMutation,
} = api;
