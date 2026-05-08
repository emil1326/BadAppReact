import { api } from './base';
import type { SidebarSection } from '../../types/sidebar';
import type { AdminMessage } from '../../types/message';
import type { WelcomeData } from '../../types/welcome';
import type { Job } from '../../types/job';

// Static JSON endpoints — data never changes within a session, so we
// never want RTK Query to evict and re-fetch.
const staticApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetSidebarQuery,
  useGetMessagesQuery,
  useGetWelcomeQuery,
  useGetJobsQuery,
} = staticApi;
