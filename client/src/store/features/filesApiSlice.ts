import { apiSlice } from "../services/apiSlice";

export interface File {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    group: string;
    description: string;
    tags: string[];
    file: string;
    size: number;
    thumbnail: string | null;
}

const filesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        retrieveFiles: builder.query<File[], { groupId: string | null }>({
            query: ({ groupId }) => `api/files/${groupId ?? ""}`,
            providesTags: ["File"],
        }),
        updateFile: builder.mutation({
            query: ({ id, name, description, tags, group }) => ({
                url: `api/file/${id}/`,
                method: "PATCH",
                body: { name, description, tags, group }
            }),
            invalidatesTags: ["File"],
        }),
        deleteFile: builder.mutation({
            query: ({ id }) => ({
                url: `api/file/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["File"],
        }),
        uploadFile: builder.mutation({
            query: (data) => ({
                url: `api/files/`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["File", "Group"],
        }),
        shareFile: builder.mutation({
            query: ({ id, shareData }) => ({
                url: `api/file/${id}/share/`,
                method: "POST",
                body: shareData
            }),
            invalidatesTags: ["File"],
        }),
    }),
});

export const {
    useRetrieveFilesQuery,
    useUpdateFileMutation,
    useDeleteFileMutation,
    useUploadFileMutation,
    useShareFileMutation
} = filesApiSlice;