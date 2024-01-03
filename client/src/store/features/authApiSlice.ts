import { apiSlice } from "../services/apiSlice";

interface User {
  email: string;
}

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    retrieveUser: builder.query<User, void>({
      query: () => "users/me/",
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "auth/jwt/create/",
        method: "POST",
        body: { email, password },
      }),
    }),
    register: builder.mutation({
      query: ({ email, password }) => ({
        url: "users/",
        method: "POST",
        body: { email, password },
      }),
    }),
    verify: builder.mutation({
      query: () => ({
        url: "auth/jwt/verify/",
        method: "POST",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "auth/logout/",
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