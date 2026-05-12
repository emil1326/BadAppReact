import { api } from './baseApi';
import type { VignetteStatus, RecordSpinPayload } from '../../types/vignette';

export const vignetteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVignetteStatus: builder.query<VignetteStatus, void>({
      query: () => '/api/vignette/status',
      providesTags: ['Vignette'],
    }),

    recordVignetteSpin: builder.mutation<VignetteStatus, RecordSpinPayload>({
      query: (body) => ({ url: '/api/vignette/spin', method: 'POST', body }),
      invalidatesTags: ['Vignette'],
    }),

    resetVignette: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: '/api/vignette/reset', method: 'POST' }),
      invalidatesTags: ['Vignette'],
    }),
  }),
});

export const {
  useGetVignetteStatusQuery,
  useRecordVignetteSpinMutation,
  useResetVignetteMutation,
} = vignetteApi;
