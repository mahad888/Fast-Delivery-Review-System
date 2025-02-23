import { useState } from 'react'
import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './Components/Dashboard'
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import ReviewTagging from './Components/ReviewTagging';
import ProtectedRoute from './auth/protectRoute';


function App() {

  

  return (
    <HashRouter>
    <Routes>
  <Route path="/" element={<Login/>} />
  <Route path="/register" element= {<SignUp/>} />
  <Route element={<ProtectedRoute/>}>
  <Route path ='/dashboard' element ={<Dashboard/>}></Route>
  <Route path = '/review-tagging' element={<ReviewTagging/>}></Route>
  

  </Route>

  </Routes>
</HashRouter>

    


  )
}

export default App
