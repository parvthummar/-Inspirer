import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "./client";

export type User = {
  id: string;
  name: string;
  email: string;
  auth_provider: string;
  /** False for accounts created with Google, which have no password. */
  has_password: boolean;
  created_at: string;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string };

const ME_KEY = ["me"] as const;

/** The logged-in user, or null when nobody is logged in. */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await apiFetch<User>("/api/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<User>("/api/auth/login", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

/** Sign in or sign up with the credential from Google's button. */
export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credential: string) =>
      apiFetch<User>("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupInput) =>
      apiFetch<User>("/api/auth/signup", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      // Drop every cached query so the next user never sees this user's data.
      queryClient.clear();
      queryClient.setQueryData(ME_KEY, null);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiFetch<User>("/api/auth/me", { method: "PATCH", body: JSON.stringify({ name }) }),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { current_password: string; password: string }) =>
      apiFetch<void>("/api/auth/password", { method: "POST", body: JSON.stringify(input) }),
  });
}
