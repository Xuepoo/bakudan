import type { KnipConfig } from 'knip';
const config: KnipConfig = {
  entry: ['src/main.ts', 'functions/**/*.ts'],
  project: ['src/**/*.ts', 'functions/**/*.ts'],
  ignoreDependencies: ['@vectojs/core', '@vectojs/ui', '@vemjs/core', '@vemjs/renderer-vecto'],
};
export default config;
