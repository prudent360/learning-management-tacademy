import * as z from "zod";

export const GENDER_OPTIONS = ["male", "female", "prefer_not_to_say", "other"] as const;
export const HEAR_ABOUT_US_OPTIONS = [
  "social_media",
  "friend_referral",
  "search_engine",
  "advertisement",
  "other",
] as const;

const passwordField = z
  .string()
  .min(8, { error: "Be at least 8 characters long." })
  .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
  .regex(/[0-9]/, { error: "Contain at least one number." });

export const SignupFormSchema = z
  .object({
    firstName: z.string().min(2, { error: "First name must be at least 2 characters long." }).trim(),
    middleName: z.string().trim().optional(),
    lastName: z.string().min(2, { error: "Last name must be at least 2 characters long." }).trim(),
    gender: z.enum(GENDER_OPTIONS, { error: "Please select a gender." }),
    hearAboutUs: z.enum(HEAR_ABOUT_US_OPTIONS, { error: "Please tell us how you heard about us." }),
    email: z.email({ error: "Please enter a valid email." }).trim(),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type VerifyEmailFormState =
  | {
      error?: string;
      message?: string;
    }
  | undefined;

export type FormState =
  | {
      errors?: {
        firstName?: string[];
        middleName?: string[];
        lastName?: string[];
        gender?: string[];
        hearAboutUs?: string[];
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      /** Echoed back so the form can refill non-sensitive fields after a failed
       * submit — React 19 resets all uncontrolled inputs (including these) once
       * a form action completes. */
      values?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        gender?: string;
        hearAboutUs?: string;
        name?: string;
        email?: string;
      };
    }
  | undefined;
