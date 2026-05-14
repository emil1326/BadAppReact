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

    selectCourses: builder.mutation<{ ok: true }, { courseCodes: string[] }>({
      query: (body) => ({ url: '/api/bourse/course-selection', method: 'POST', body }),
    }),

    submitBourse: builder.mutation<{ ok: true }, { codeB: string }>({
      query: (body) => ({ url: '/api/bourse/submit', method: 'POST', body }),
    }),

    cancelBourse: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: '/api/bourse/cancel', method: 'POST' }),
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useSubmitBourseFormMutation,
  useConvertCodeMutation,
  useSelectCoursesMutation,
  useSubmitBourseMutation,
  useCancelBourseMutation,
} = bourseApi;
