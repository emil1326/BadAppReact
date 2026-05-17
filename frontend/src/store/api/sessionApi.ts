import { setFlow, updateFlow } from '../slices/flowSlice';
import { api } from './baseApi';

export const sessionApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
          dispatch(updateFlow({ latestCodeSvg: null }));
        } catch {
          void 0;
        }
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
  useStartBourseFlowMutation,
  useCheckTimerMutation,
  useRegenerateCodeMutation,
} = sessionApi;
