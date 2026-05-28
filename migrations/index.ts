import * as migration_20260524_135927_initial from './20260524_135927_initial';
import * as migration_20260526_162656_case_studies_drop_custom_status from './20260526_162656_case_studies_drop_custom_status';
import * as migration_20260528_180745_add_products from './20260528_180745_add_products';
import * as migration_20260528_204729_add_expertises_sectors from './20260528_204729_add_expertises_sectors';
import * as migration_20260528_223718_add_team from './20260528_223718_add_team';

export const migrations = [
  {
    up: migration_20260524_135927_initial.up,
    down: migration_20260524_135927_initial.down,
    name: '20260524_135927_initial',
  },
  {
    up: migration_20260526_162656_case_studies_drop_custom_status.up,
    down: migration_20260526_162656_case_studies_drop_custom_status.down,
    name: '20260526_162656_case_studies_drop_custom_status',
  },
  {
    up: migration_20260528_180745_add_products.up,
    down: migration_20260528_180745_add_products.down,
    name: '20260528_180745_add_products',
  },
  {
    up: migration_20260528_204729_add_expertises_sectors.up,
    down: migration_20260528_204729_add_expertises_sectors.down,
    name: '20260528_204729_add_expertises_sectors',
  },
  {
    up: migration_20260528_223718_add_team.up,
    down: migration_20260528_223718_add_team.down,
    name: '20260528_223718_add_team'
  },
];
