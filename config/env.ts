import { config } from './Config';

export type AppEnv = typeof config;
export const env: AppEnv = config;
