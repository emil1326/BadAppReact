import { api } from './baseApi';
import type { NotesStatus, NotesSnapshot } from '../../types/notes';

export const notesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotesStatus: builder.query<NotesStatus, void>({
      query: () => '/api/notes/status',
      providesTags: ['Notes'],
    }),

    requestNotes: builder.mutation<NotesSnapshot, void>({
      query: () => ({ url: '/api/notes/request', method: 'POST' }),
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const { useGetNotesStatusQuery, useRequestNotesMutation } = notesApi;
