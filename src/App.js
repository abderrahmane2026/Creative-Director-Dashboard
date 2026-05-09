import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';

import ProtectedRoute from './components/ProtectedRoute';
import Overview from './pages/Overview';
import Bookings from './pages/Bookings';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';


import Clients from '../src/pages/Clients';
import Works from './pages/Works';
  
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/works"   element={<ProtectedRoute><Works /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;