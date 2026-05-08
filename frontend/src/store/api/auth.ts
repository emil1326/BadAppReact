import { api } from './base';
import { resetAuth, setAuth } from '../slices/authSlice';

const authApi = api.injectEndpoints({
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
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
