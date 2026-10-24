import React from 'react';
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { DonorRegister, LoginPage, StaffRegister } from "./pages/AuthPages";
import { DonorDashboard, DonorProfile, BookAppointment, DonorAppointments, DonorDonationHistory } from "./pages/DonorPages";
import { StaffDashboard, StaffAppointments } from "./pages/StaffPages";
import { useAuth } from "./context/AuthContext";

function Footer() {
  return <footer className="footer"><div><Link to="/" className="brand footer-brand"><span className="brand-icon">♥</span> LifeDrop</Link><p>Small acts of kindness. A community full of hope.</p></div><span>DBMS Microproject · Blood Donation Management System</span></footer>;
}

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const homeTarget = isAuthenticated ? (user?.role === "staff" || user?.role === "admin" ? "/staff/dashboard" : "/donor/dashboard") : "/";
  return <><Navbar/><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/donor/register" element={<DonorRegister/>}/>
    <Route path="/donor/login" element={<LoginPage role="donor"/>}/>
    <Route path="/staff/register" element={<StaffRegister/>}/>
    <Route path="/staff/login" element={<LoginPage role="staff"/>}/>
    <Route element={<ProtectedRoute allowedRoles={["donor"]}/>}>
      <Route path="/donor/dashboard" element={<DonorDashboard/>}/>
      <Route path="/donor/profile" element={<DonorProfile/>}/>
      <Route path="/donor/book-appointment" element={<BookAppointment/>}/>
      <Route path="/donor/appointments" element={<DonorAppointments/>}/>
      <Route path="/donor/donations" element={<DonorDonationHistory/>}/>
    </Route>
    <Route element={<ProtectedRoute allowedRoles={["staff","admin"]}/>}>
      <Route path="/staff/dashboard" element={<StaffDashboard/>}/>
      <Route path="/staff/appointments" element={<StaffAppointments/>}/>
    </Route>
    <Route path="/dashboard" element={<Navigate to={homeTarget} replace/>}/>
    <Route path="*" element={<main className="content-page"><div className="empty-state"><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link to="/" className="button button-primary">Go home</Link></div></main>}/>
  </Routes><Footer/></>;
}
