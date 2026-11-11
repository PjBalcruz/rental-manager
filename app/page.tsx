"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function WhoAmI() {
  const me = useQuery(api.users.whoAmI);
  if (me === undefined) return <p>Loading...</p>;
  if (me === null) return <p>Convex does not see you as logged in.</p>;
  return <p>Convex says you are: {me.name ?? me.email ?? me.tokenIdentifier}</p>;
}

export default function Home() {
  return (
    <main className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Rental Manager</h1>

      <Unauthenticated>
        <div className="flex gap-3">
          <SignInButton />
          <SignUpButton />
        </div>
      </Unauthenticated>

      <Authenticated>
        <UserButton />
        <WhoAmI />
      </Authenticated>
    </main>
  );
}