import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Rental Manager schema.
// Convex adds `_id` and `_creationTime` to every document automatically.
//
// Notes:
// - `ownerId` is the logged-in owner's identity (identity.tokenIdentifier).
//   It is stored on every table so each query can quickly check ownership.
// - Dates are ISO strings ("2026-11-11"). Months are "YYYY-MM".
// - Money is stored in whole pesos or centavos; pick one and stay consistent.

export default defineSchema({
  properties: defineTable({
    ownerId: v.string(),
    name: v.string(),
    address: v.string(),
    description: v.optional(v.string()),
  }).index("by_owner", ["ownerId"]),

  units: defineTable({
    ownerId: v.string(),
    propertyId: v.id("properties"),
    name: v.string(), // e.g. "Unit 2A" or "Room 3"
    rentPrice: v.number(), // monthly rent
    status: v.union(
      v.literal("vacant"),
      v.literal("occupied"),
      v.literal("maintenance"),
    ),
    bedrooms: v.optional(v.number()),
    description: v.optional(v.string()),
    photoIds: v.optional(v.array(v.id("_storage"))),
    isListed: v.boolean(), // show on the public listing page?
  })
    .index("by_owner", ["ownerId"])
    .index("by_property", ["propertyId"])
    .index("by_listed", ["isListed", "status"]),

  tenants: defineTable({
    ownerId: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    // Set when the tenant has a login (for the future tenant portal).
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_user", ["userId"]),

  leases: defineTable({
    ownerId: v.string(),
    unitId: v.id("units"),
    tenantId: v.id("tenants"),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    monthlyRent: v.number(),
    deposit: v.number(),
    dueDay: v.number(), // day of month rent is due (1-28)
    status: v.union(v.literal("active"), v.literal("ended")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_status", ["ownerId", "status"])
    .index("by_unit", ["unitId"])
    .index("by_tenant", ["tenantId"]),

  payments: defineTable({
    ownerId: v.string(),
    leaseId: v.id("leases"),
    month: v.string(), // "2026-11"
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("late"),
    ),
    paidAt: v.optional(v.number()), // timestamp (ms)
    method: v.optional(v.string()), // cash, GCash, bank transfer...
    receiptStorageId: v.optional(v.id("_storage")),
    note: v.optional(v.string()),
  })
    .index("by_owner_and_month", ["ownerId", "month"])
    .index("by_lease", ["leaseId"])
    .index("by_lease_and_month", ["leaseId", "month"]),
});