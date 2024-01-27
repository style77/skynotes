import { apiSlice } from "../services/apiSlice";

interface User {
  email: string;
  id: number;
  storage_limit: number;
  storage_used: number;
  created_at: string;
}

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    retrieveUser: builder.query<User, void>({
      query: () => "api/users/me/",
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "api/auth/jwt/create/",
        method: "POST",
        body: { email, password },
      }),
    }),
    register: builder.mutation({
      query: ({ email, password }) => ({
        url: "api/users/",
        method: "POST",
        body: { email, password },
      }),
    }),
    verify: builder.mutation({
      query: () => ({
        url: "api/auth/jwt/verify/",
        method: "POST",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "api/auth/logout/",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRetrieveUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useVerifyMutation,
  useLogoutMutation,
} = authApiSlice;