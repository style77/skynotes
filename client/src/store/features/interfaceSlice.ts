import { createSlice } from "@reduxjs/toolkit";

interface InterfaceState {
  showYScroll: boolean;
  contextMenuFunctionality: boolean;
}

const initialState: InterfaceState = {
  showYScroll: true,
  contextMenuFunctionality: true,
};

const interfaceSlice = createSlice({
  name: "interface",
  initialState,
  reducers: {
    setShowYScroll: (state, action) => {
      state.showYScroll = action.payload;
      document.body.style.overflowY = action.payload ? "auto" : "hidden";
    },
    setContextMenuFunctionality: (state, action) => {
      state.contextMenuFunctionality = action.payload;
    },
  },
});

export const { setShowYScroll, setContextMenuFunctionality } = interfaceSlice.actions;
export default interfaceSlice.reducer;