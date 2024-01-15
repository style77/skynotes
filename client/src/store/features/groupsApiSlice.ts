import { apiSlice } from "../services/apiSlice";

export interface Group {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    icon: string;
    description: string;
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
    }),
});

export const {
    useRetrieveGroupsQuery,
    useCreateGroupMutation
} = groupsApiSlice;