import { api } from './baseApi';

export const codesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    init2FA: builder.mutation<{ ok: true }, { email: string }>({
      query: (body) => ({
        url: '/api/codes/init-2fa',
        method: 'POST',
        body,
      }),
    }),

    verify2FA: builder.mutation<{ ok: true }, { code: string; email: string }>({
      query: (body) => ({
        url: '/api/codes/verify-2fa',
        method: 'POST',
        body,
      }),
    }),

    exchangeCodeA: builder.mutation<{ codeB: string }, { codeA: string }>({
      query: (body) => ({
        url: '/api/codes/exchange-a-for-b',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useInit2FAMutation,
  useVerify2FAMutation,
  useExchangeCodeAMutation,
} = codesApi;
