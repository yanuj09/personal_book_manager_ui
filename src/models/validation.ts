/**
 * Validation rules, expressed against the models rather than against forms.
 *
 * The same rule set can back a form, a controller or (later) a server action,
 * so a field can never be valid in one place and invalid in another.
 */

import type { BookDraft } from "./book.model";
import type {
  Credentials,
  PasswordChange,
  ProfileUpdate,
  SignupPayload,
} from "./user.model";

/** Field name → message. An empty object means "valid". */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  titleMax: 120,
  authorMax: 80,
  descriptionMax: 600,
  notesMax: 2000,
  nameMax: 60,
  passwordMin: 8,
  tagsMax: 8,
} as const;

export function isValid<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length === 0;
}

export function validateBookDraft(draft: BookDraft): FieldErrors<BookDraft> {
  const errors: FieldErrors<BookDraft> = {};

  const title = draft.title.trim();
  if (!title) errors.title = "Give the book a title.";
  else if (title.length > LIMITS.titleMax)
    errors.title = `Keep the title under ${LIMITS.titleMax} characters.`;

  const author = draft.author.trim();
  if (!author) errors.author = "Who wrote it?";
  else if (author.length > LIMITS.authorMax)
    errors.author = `Keep the author under ${LIMITS.authorMax} characters.`;

  if (draft.description.length > LIMITS.descriptionMax)
    errors.description = `Descriptions are capped at ${LIMITS.descriptionMax} characters.`;

  if (draft.notes.length > LIMITS.notesMax)
    errors.notes = `Notes are capped at ${LIMITS.notesMax} characters.`;

  if (draft.tags.length > LIMITS.tagsMax)
    errors.tags = `Up to ${LIMITS.tagsMax} tags — pick the ones that matter.`;

  if (draft.progress < 0 || draft.progress > 100)
    errors.progress = "Progress runs from 0 to 100.";

  return errors;
}

export function validateCredentials(
  credentials: Credentials,
): FieldErrors<Credentials> {
  const errors: FieldErrors<Credentials> = {};

  if (!credentials.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(credentials.email.trim()))
    errors.email = "That doesn't look like an email address.";

  if (!credentials.password) errors.password = "Password is required.";

  return errors;
}

export function validateSignup(
  payload: SignupPayload,
): FieldErrors<SignupPayload> {
  const errors: FieldErrors<SignupPayload> = validateCredentials(payload);

  const name = payload.name.trim();
  if (!name) errors.name = "What should we call you?";
  else if (name.length > LIMITS.nameMax)
    errors.name = `Keep it under ${LIMITS.nameMax} characters.`;

  // Signup holds passwords to a higher bar than login, which only checks presence.
  if (payload.password && payload.password.length < LIMITS.passwordMin)
    errors.password = `Use at least ${LIMITS.passwordMin} characters.`;

  return errors;
}

export function validateProfile(
  profile: ProfileUpdate,
): FieldErrors<ProfileUpdate> {
  const errors: FieldErrors<ProfileUpdate> = {};

  const name = profile.name.trim();
  if (!name) errors.name = "Name can't be empty.";
  else if (name.length > LIMITS.nameMax)
    errors.name = `Keep it under ${LIMITS.nameMax} characters.`;

  if (!profile.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(profile.email.trim()))
    errors.email = "That doesn't look like an email address.";

  return errors;
}

export function validatePasswordChange(
  change: PasswordChange & { confirmPassword: string },
): FieldErrors<PasswordChange & { confirmPassword: string }> {
  const errors: FieldErrors<PasswordChange & { confirmPassword: string }> = {};

  if (!change.currentPassword)
    errors.currentPassword = "Enter your current password.";

  if (!change.newPassword) errors.newPassword = "Choose a new password.";
  else if (change.newPassword.length < LIMITS.passwordMin)
    errors.newPassword = `Use at least ${LIMITS.passwordMin} characters.`;

  if (change.newPassword !== change.confirmPassword)
    errors.confirmPassword = "Passwords don't match.";

  return errors;
}
