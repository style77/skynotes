import { apiSlice } from "../services/apiSlice";

export interface Group {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    icon: string;
    description: string;
    size: number;
    files: number;
}

const groupsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        retrieveGroups: builder.query<Group[], void>({
            query: () => "api/groups/",
            providesTags: ["Group"],
        }),
        createGroup: builder.mutation({
            query: ({ name, icon, description }) => ({
                url: "api/groups/",
                method: "POST",
                body: { name, icon, description }
            }),
            invalidatesTags: ["Group"],
        }),
        updateGroup: builder.mutation({
            query: ({ id, name, icon, description }) => ({
                url: `api/groups/${id}/`,
                method: "PATCH",
                body: { name, icon, description }
            }),
            invalidatesTags: ["Group"],
        }),
        deleteGroup: builder.mutation({
            query: ({ id }) => ({
                url: `api/groups/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Group"],
        }),
    }),
});

export const {
    useRetrieveGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation
} = groupsApiSlice;