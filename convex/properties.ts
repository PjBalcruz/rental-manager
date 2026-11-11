import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwner } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwner(ctx);
    return await ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwner(ctx);

    const name = args.name.trim();
    const address = args.address.trim();
    if (name.length === 0 || name.length > 100) {
      throw new Error("Name must be 1-100 characters");
    }
    if (address.length === 0 || address.length > 200) {
      throw new Error("Address must be 1-200 characters");
    }

    return await ctx.db.insert("properties", {
      ownerId,
      name,
      address,
      description: args.description?.trim(),
    });
  },
});

export const remove = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const ownerId = await requireOwner(ctx);

    const property = await ctx.db.get(args.propertyId);
    if (property === null || property.ownerId !== ownerId) {
      throw new Error("Property not found");
    }

    // Do not delete a property that still has units.
    const unit = await ctx.db
      .query("units")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .first();
    if (unit !== null) {
      throw new Error("Delete this property's units first");
    }

    await ctx.db.delete(args.propertyId);
  },
});