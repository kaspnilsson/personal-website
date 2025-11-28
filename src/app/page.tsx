"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = "idle" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const showValidation = touched && email.length > 0;
  const isValid = isValidEmail(email);
  const showError = showValidation && !isValid;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!isValid) {
      setFormState("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormState("success");
        setEmail("");
      } else {
        setFormState("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setFormState("error");
      setErrorMessage("Unable to connect. Please try again later.");
    }
  };

  return (
    <main className="font-sans min-h-screen flex items-center justify-center px-4 py-10 sm:px-20 sm:py-16">
      <div className="max-w-md w-full text-center">
        <header className="mb-8">
          <div className="title-eyebrow">Electronic Music Producer / DJ</div>
          <h1 className="display heading-tight">kasp</h1>
          <div className="title-rule" />
        </header>

        {formState === "success" ? (
          <div className="text-sm/6 opacity-90">
            You&apos;re in. Watch your inbox for new music, shows, and exclusive drops.
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm/6 opacity-90">
              Subscribe for new releases and exclusive content.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={formState === "loading"}
                className={`text-center ${showError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""}`}
                aria-label="Email address"
                aria-invalid={showError}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={formState === "loading" || (touched && !isValid)}
              >
                {formState === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>

              {(showError || (formState === "error" && errorMessage)) && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage || "Please enter a valid email address."}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
