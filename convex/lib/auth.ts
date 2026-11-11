import { MutationCtx, QueryCtx } from "../_generated/server";

// Returns the logged-in owner's id, or throws if nobody is logged in.
export async function requireOwner(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}