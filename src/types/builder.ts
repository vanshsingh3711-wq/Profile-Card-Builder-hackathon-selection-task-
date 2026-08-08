export type BuilderProfile = {
  name: string;
  role: string;
  stack: string[];
  builderTitle: string;
  photo: string | null;
};

export type CardStyle = 'editorial' | 'terminal' | 'goa';

/**
 * Bounding box (in pixel coordinates) describing where
 * the main subject sits inside the original uploaded image.
 */
export interface SubjectBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Classification returned by the AI validator. */
export type SubjectType = 'human' | 'anime' | 'illustration' | 'invalid';

/** Response shape returned by `/api/validate-photo`. */
export interface PhotoValidationResult {
  valid: boolean;
  type: SubjectType;
  reason: string;
  subjectBox: SubjectBox | null;
}
