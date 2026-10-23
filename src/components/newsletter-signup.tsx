"use client";

import { FormEvent, useState } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

const failureMessages: Record<number, string> = {
  400: "That address was not accepted. Check it and try again.",
  503: "Email signup is unavailable right now. Try again later.",
};

export function NewsletterSignup() {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [failure, setFailure] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionState === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");

    if (typeof email !== "string" || !email.trim()) {
      setFailure("Enter an email address.");
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
        setFailure(
          failureMessages[response.status] ??
            "The signup did not go through. Try again.",
        );
        setSubmissionState("error");
        return;
      }

      form.reset();
      setSubmissionState("success");
    } catch {
      setFailure("The signup did not go through. Check your connection and try again.");
      setSubmissionState("error");
    }
  }

  if (submissionState === "success") {
    return (
      <p className="signup-status" role="status">
        Thanks. If a confirmation email arrives, open its link to finish signing up.
      </p>
    );
  }

  const submitting = submissionState === "submitting";

  return (
    <form
      className="signup-form"
      onSubmit={handleSubmit}
      aria-busy={submitting}
    >
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />
      <label className="site-label" htmlFor="signup-email">
        Email address
      </label>
      <input
        id="signup-email"
        className="field-input"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        aria-describedby={submissionState === "error" ? "signup-error" : undefined}
        required
      />
      <button
        type="submit"
        className="editorial-link signup-submit"
        aria-disabled={submitting}
      >
        <span>{submitting ? "Subscribing" : "Subscribe"}</span>
        <span aria-hidden="true">⟶</span>
      </button>
      {submissionState === "error" && (
        <p id="signup-error" className="signup-status signup-status--error" role="alert">
          {failure}
        </p>
      )}
    </form>
  );
}
