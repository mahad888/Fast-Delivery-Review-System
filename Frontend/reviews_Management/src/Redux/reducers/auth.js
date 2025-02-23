import { createSlice } from "@reduxjs/toolkit";

const authSlice =  createSlice({
    name: 'auth',
    initialState: {
        user: null,
        reviews: [],
        loader: true,
        role: null
       
    },
    reducers: {
        setUserFromStorage(state, action) {
            state.user = action.payload;
          },
        userExist: (state, action) => {
            state.user = action.payload;
            state.loader=false;
            console.log("User set in state:", action.payload);

        },
        setRole(state, action){
            state.role = action.payload;
            console.log("Role set in state:", action.payload);
        },
        userNotExist:(state) => {
            state.user = null;
            state.loader=false;
        },
        setReviews: (state, action) => {
            state.movies = action.payload;
          },
           
        
    },
});
 
export default authSlice;
export const {setUserFromStorage,userExist, userNotExist,setRole,setReviews} = authSlice.actions;