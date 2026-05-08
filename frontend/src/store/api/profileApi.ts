import { setProfile } from '../slices/profileSlice';
import type { Profile, ProfileMode } from '../../types/profile';
import { api } from './baseApi';

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useGetProfileQuery, useSetProfileModeMutation } = profileApi;
