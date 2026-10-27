/** feature/sysc/dto — endpoint: GET /v1/sync-statuses */
import type { UUID } from './common';

export interface SyncStatusResponse { id: UUID; code: string; name: string }
