import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
const uiSlice=createSlice({name:'ui',initialState:{sidebarCollapsed:false},reducers:{setSidebarCollapsed(state,action:PayloadAction<boolean>){state.sidebarCollapsed=action.payload;}}});
export const { setSidebarCollapsed }=uiSlice.actions; export default uiSlice.reducer;
