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
    thumbnail: string;
}

const filesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        retrieveRootFiles: builder.query<File[], void>({
            query: () => "api/files/",
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
        uploadFile: builder.mutation<object, FormData>({
            query: (data) => ({
                url: `api/files/`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["File", "Group"],
        }),
    }),
});

export const {
    useRetrieveRootFilesQuery,
    useUpdateFileMutation,
    useDeleteFileMutation,
    useUploadFileMutation
} = filesApiSlice;