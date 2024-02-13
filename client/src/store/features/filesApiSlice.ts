import { ShareStatistics, ShareToken, StorageFile } from "@/types/filesTypes";
import { apiSlice } from "../services/apiSlice";

const filesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        retrieveFiles: builder.query<StorageFile[], { groupId: string | null }>({
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
            invalidatesTags: ["File", "Share"],
        }),
        retrieveShareTokens: builder.query<ShareToken[], { fileId: string }>({
            query: ({ fileId }) => `api/file/${fileId}/share/`,
            providesTags: ["Share"],
        }),
        revokeShareToken: builder.mutation({
            query: ({ fileId, token }) => ({
                url: `api/file/${fileId}/share/${token}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Share"],
        }),
        retrieveShareStatistics: builder.query<ShareStatistics[], { fileId: string, token: string }>({
            query: ({ fileId, token }) => `api/file/${fileId}/share/${token}/analytics/`,
        }),
    }),
});

export const {
    useRetrieveFilesQuery,
    useUpdateFileMutation,
    useDeleteFileMutation,
    useUploadFileMutation,
    useShareFileMutation,
    useRetrieveShareTokensQuery,
    useRevokeShareTokenMutation,
    useRetrieveShareStatisticsQuery
} = filesApiSlice;