import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowsersRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './Components/Dashboard'
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import ReviewTagging from './Components/ReviewTagging';
import ProtectedRoute from './auth/protectRoute';


function App() {

  

  return (
    <BrowserRouter>
    <Routes>
  <Route path="/" element={<Login/>} />
  <Route path="/register" element= {<SignUp/>} />
  <Route element={<ProtectedRoute/>}>
  <Route path ='/dashboard' element ={<Dashboard/>}></Route>
  <Route path = '/review-tagging' element={<ReviewTagging/>}></Route>
  

  </Route>

  </Routes>
</BrowserRouter>

    


  )
}

export default App
