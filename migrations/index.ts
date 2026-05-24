import * as migration_20260524_135927_initial from './20260524_135927_initial';

export const migrations = [
  {
    up: migration_20260524_135927_initial.up,
    down: migration_20260524_135927_initial.down,
    name: '20260524_135927_initial'
  },
];
