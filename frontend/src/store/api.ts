/**
 * Barrel for the RTK Query API. Re-exports the base `api` instance and the
 * generated hooks from each per-domain module. Importing this file
 * transitively pulls in every `injectEndpoints` call so the api is fully
 * populated by the time `store.ts` mounts the reducer.
 */
export { api } from './api/baseApi';
export * from './api/authApi';
export * from './api/bourseApi';
export * from './api/dataApi';
export * from './api/notesApi';
export * from './api/profileApi';
export * from './api/sessionApi';
export * from './api/vignetteApi';
