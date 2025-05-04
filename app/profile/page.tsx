"use client";

import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/sign-out-button";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/sign-in");
    }
  }, [session, isPending]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  const { user } = session;

  const isGoogleAccount =
    user.image?.includes("googleusercontent.com") || false;

  return (
    <div className="mx-auto max-w-4xl md:px-4 md:py-12">
      <div className="md:rounded-lg border border-neutral-200 bg-white p-8 shadow-md">
        <div className="flex flex-col items-center space-y-4 text-center sm:flex-row sm:space-x-8 sm:space-y-0 sm:text-left">
          <div className="relative h-24 w-24">
            <div className="h-24 w-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : user.name ? (
                <span className="text-3xl font-bold text-neutral-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-3xl font-bold text-neutral-600">?</span>
              )}
            </div>
            {user.emailVerified && (
              <div className="absolute border bottom-2 -right-0.5 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name || "User"}</h1>
            <p className="text-neutral-600">{user.email}</p>
          </div>
          <SignOutButton className="mt-auto w-full md:w-fit" />
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-xl font-semibold">Account Information</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Email</dt>
              <dd className="mt-1 text-sm text-neutral-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Name</dt>
              <dd className="mt-1 text-sm text-neutral-900">
                {user.name || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Account ID</dt>
              <dd className="mt-1 text-sm text-neutral-900">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">
                Account Created
              </dt>
              <dd className="mt-1 text-sm text-neutral-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">
                Authentication Provider
              </dt>
              <dd className="mt-1 text-sm text-neutral-900">
                {isGoogleAccount ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="mr-1.5 h-4 w-4"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="google"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 488 512"
                    >
                      <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                      ></path>
                    </svg>
                    Google
                  </span>
                ) : (
                  "Email/Password"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          href="/dashboard"
          className="mt-8 border-t border-neutral-200 pt-8 flex items-center justify-between"
        >
          <Button className="w-full">
            View Your Analysis History <ArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
