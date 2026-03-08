import { config } from '../../config/Config';

export type AppEnv = typeof config;
export const env: AppEnv = config;
