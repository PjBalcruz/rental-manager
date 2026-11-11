"use client";

import { FormEvent, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function PropertiesPanel() {
  const properties = useQuery(api.properties.list);
  const createProperty = useMutation(api.properties.create);
  const removeProperty = useMutation(api.properties.remove);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createProperty({ name, address });
      setName("");
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

    async function handleDelete(propertyId: Id<"properties">) {
    setError(null);
    try {
      await removeProperty({ propertyId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="rounded border border-neutral-600 bg-transparent p-2"
          placeholder="Property name (e.g. Casa Verde)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
        <input
          className="rounded border border-neutral-600 bg-transparent p-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={200}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add property"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Your properties</h2>
        {properties === undefined && <p>Loading...</p>}
        {properties?.length === 0 && <p>No properties yet. Add one above.</p>}
        <ul className="flex flex-col gap-2">
          {properties?.map((p) => (
            <li
              key={p._id}
              className="flex items-center justify-between rounded border border-neutral-700 p-3"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-neutral-400">{p.address}</p>
              </div>
              <button
                onClick={() => handleDelete(p._id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <main className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Properties</h1>
      <Unauthenticated>
        <p>Please sign in to manage your properties.</p>
        <div>
          <SignInButton />
        </div>
      </Unauthenticated>
      <Authenticated>
        <PropertiesPanel />
      </Authenticated>
    </main>
  );
}