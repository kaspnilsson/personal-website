"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup() {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionState === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");

    if (typeof email !== "string" || !email.trim()) {
      setSubmissionState("error");
      return;
    }

    setSubmissionState("submitting");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) {
        throw new Error(`Signup request failed with ${response.status}`);
      }

      form.reset();
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
    }
  }

  if (submissionState === "success") {
    return (
      <p className="signup-status" role="status">
        Check your inbox if confirmation is needed.
      </p>
    );
  }

  return (
    <form
      className="signup-form"
      onSubmit={handleSubmit}
      aria-busy={submissionState === "submitting"}
    >
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />
      <Input
        name="email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        aria-label="Email address"
        required
        className="h-11 text-center bg-secondary border-border placeholder:text-[#969696]"
      />
      <Button
        type="submit"
        className="h-11 w-full"
        aria-disabled={submissionState === "submitting"}
      >
        {submissionState === "submitting" ? "Subscribing..." : "Subscribe"}
      </Button>
      {submissionState === "error" && (
        <p className="signup-status" role="alert" aria-live="polite">
          That did not go through. Please try again.
        </p>
      )}
    </form>
  );
}
