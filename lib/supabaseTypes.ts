// lib/supabaseTypes.ts
// Temporary local Supabase row types used until generated types are available.
// To generate: npx supabase gen types typescript --linked > lib/database.types.ts
// then replace these with imports from that file.

/** Shape of a row from the user_credits table */
export type UserCreditsRow = {
  plan_type: string | null;
  remaining_credits: number | null;
  renewal_date: string | null;
};

/** Shape of a user_credits row when only plan_type is selected */
export type UserPlanRow = {
  plan_type: string | null;
};
