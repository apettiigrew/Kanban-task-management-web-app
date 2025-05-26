
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { signUpSchema } from "@/utils/validation-schemas";

export type SignUpData = z.infer<typeof signUpSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SignUpData>({
    mutationFn: async (newUserData: SignUpData) => {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign up");
      }

      return response.json();
    },
    onSuccess: () => {
      // Optionally invalidate user-related queries or redirect
      // For now, we'll just log success, actual redirection/invalidation
      // can be handled in the component or based on specific app flow.
      console.log("Signup successful, user data could be refetched or cache updated.");
    },
    // onError is implicitly handled by react-query and can be accessed in the component
  });
}
