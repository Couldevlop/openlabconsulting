import * as migration_20260524_135927_initial from './20260524_135927_initial';
import * as migration_20260525_060131_insights_hub_global from './20260525_060131_insights_hub_global';

export const migrations = [
  {
    up: migration_20260524_135927_initial.up,
    down: migration_20260524_135927_initial.down,
    name: '20260524_135927_initial',
  },
  {
    up: migration_20260525_060131_insights_hub_global.up,
    down: migration_20260525_060131_insights_hub_global.down,
    name: '20260525_060131_insights_hub_global'
  },
];
