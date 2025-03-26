"use client";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SignOutButton({ className }: { className: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}