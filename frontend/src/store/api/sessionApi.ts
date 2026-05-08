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
          // Successful verification burns the code server-side; clear the
          // cached SVG so the UI reflects the same state.
          dispatch(updateFlow({ latestCodeSvg: null }));
        } catch {
          // Leave the cached code untouched on failure.
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
