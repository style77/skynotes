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
        }),
    }),
});

export const {
    useRetrieveRootFilesQuery,
} = filesApiSlice;