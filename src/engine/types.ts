/** Small shared types that do not depend on zod (safe to import anywhere at runtime). */
export interface MapPoint {
  x: number;
  y: number;
}

export type {
  CaseFile,
  Evidence,
  EvidenceOfType,
  EvidenceAppId,
  Question,
  VerdictQuestion,
  OpenQuestion,
  Verdict,
  Relation,
  Drop,
  DropTrigger,
  WarrantRequest,
  Person,
  Device,
  MapMarker,
} from './schema';
