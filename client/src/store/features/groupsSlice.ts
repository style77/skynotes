import { createSlice } from "@reduxjs/toolkit";
import { Group } from "./groupsApiSlice";
import { StorageFile } from "@/types/filesTypes";

interface AuthState {
    groups: Group[];
    files: StorageFile[];
}

const initialState: AuthState = {
    groups: [],
    files: [],
};

const groupSlice = createSlice({
    name: "groups",
    initialState,
    reducers: {
        fetchGroups: (state, action) => {
            state.groups = action.payload;
        },
        fetchFiles: (state, action) => {
            state.files = action.payload;
        }
    },
});

export const { fetchFiles, fetchGroups } = groupSlice.actions;
export default groupSlice.reducer;