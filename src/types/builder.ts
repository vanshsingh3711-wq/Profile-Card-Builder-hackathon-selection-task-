export type BuilderProfile = {
  name: string;
  role: string;
  stack: string[];
  builderTitle: string;
  photo: string | null;
  shareId?: string;
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

export type Step = 'photo' | 'identity' | 'design' | 'result';

export interface BuilderIdentityDraft {
  showManual: boolean;
  manual: { name: string; role: string; builderTitle: string };
  stackInput: string;
  stack: string[];
}

export type Message = { role: 'assistant' | 'user'; content: string };

export interface BuilderChatDraft {
  messages: Message[];
  aiState: { profile: { name: string | null; role: string | null; stack: string[] }; pendingTitles: string[] | null };
  selectedTitle: string | null;
}

export interface BuilderResultDraft {
  isEditing: boolean;
  editProfile: BuilderProfile | null;
}

export interface BuilderDraft {
  step: Step;
  profile: BuilderProfile;
  cardStyle: CardStyle;
  identity: BuilderIdentityDraft;
  chat: BuilderChatDraft;
  result: BuilderResultDraft;
}

export const EMPTY_PROFILE: BuilderProfile = {
  name: '',
  role: '',
  stack: [],
  builderTitle: '',
  photo: null,
};

export const DEFAULT_DRAFT: BuilderDraft = {
  step: 'photo',
  profile: EMPTY_PROFILE,
  cardStyle: 'editorial',
  identity: {
    showManual: false,
    manual: { name: '', role: '', builderTitle: '' },
    stackInput: '',
    stack: [],
  },
  chat: {
    messages: [{ role: 'assistant', content: "Hey! 👋 I'm your Studio AI. What's your name and what do you build?" }],
    aiState: { profile: { name: null, role: null, stack: [] }, pendingTitles: null },
    selectedTitle: null,
  },
  result: {
    isEditing: false,
    editProfile: null,
  }
};
