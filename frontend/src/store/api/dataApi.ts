import type { SidebarSection } from '../../types/sidebar';
import type { AdminMessage } from '../../types/message';
import type { WelcomeData } from '../../types/welcome';
import type { Job } from '../../types/job';
import type { RendezVousSlot } from '../../types/rendezVous';
import type { VignetteContent, ModeHelp, Casier } from '../../types/content';
import type { Consentement } from '../../types/consentement';
import type { SignalementFantome } from '../../types/signalement';
import type { CourseList } from '../../types/bourse';
import { api } from './baseApi';

/**
 * Static JSON endpoints — data never changes within a session, so we never
 * want RTK Query to evict and re-fetch. `keepUnusedDataFor: Infinity` keeps
 * the cache alive even when no component is currently subscribed.
 */
export const dataApi = api.injectEndpoints({
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

    getRendezVousSlots: builder.query<RendezVousSlot[], void>({
      query: () => '/data/rendez-vous-slots.json',
      keepUnusedDataFor: Infinity,
    }),

    getVignetteContent: builder.query<VignetteContent, void>({
      query: () => '/data/vignette-content.json',
      keepUnusedDataFor: Infinity,
    }),

    getModeHelp: builder.query<ModeHelp, void>({
      query: () => '/data/mode-help.json',
      keepUnusedDataFor: Infinity,
    }),

    getConsentements: builder.query<Consentement[], void>({
      query: () => '/data/consentements.json',
      keepUnusedDataFor: Infinity,
    }),

    getSignalementsFantomes: builder.query<SignalementFantome[], void>({
      query: () => '/data/signalements-fantomes.json',
      keepUnusedDataFor: Infinity,
    }),

    getCourseList: builder.query<CourseList, void>({
      query: () => '/data/course-codes.json',
      keepUnusedDataFor: Infinity,
    }),

    getCasiers: builder.query<Casier[], void>({
      query: () => '/data/casiers.json',
      keepUnusedDataFor: Infinity,
    }),
  }),
});

export const {
  useGetSidebarQuery,
  useGetMessagesQuery,
  useGetWelcomeQuery,
  useGetJobsQuery,
  useGetRendezVousSlotsQuery,
  useGetVignetteContentQuery,
  useGetModeHelpQuery,
  useGetConsentementsQuery,
  useGetSignalementsFantomesQuery,
  useGetCourseListQuery,
  useGetCasiersQuery,
} = dataApi;
