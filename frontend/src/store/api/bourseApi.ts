import { api } from './baseApi';
import type { BourseBalance, BourseFormFields, CourseCodeResult } from '../../types/bourse';

export const bourseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalance: builder.query<BourseBalance, void>({
      query: () => '/api/bourse/balance',
    }),

    submitBourseForm: builder.mutation<{ ok: true }, BourseFormFields>({
      query: (body) => ({ url: '/api/bourse/form', method: 'POST', body }),
    }),

    convertCode: builder.mutation<CourseCodeResult, { bulletinCode: string }>({
      query: (body) => ({ url: '/api/bourse/convert-code', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useSubmitBourseFormMutation,
  useConvertCodeMutation,
} = bourseApi;
