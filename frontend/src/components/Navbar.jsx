import React from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "staff" || user?.role === "admin";
  const links = isStaff
    ? [["Dashboard", "/staff/dashboard"], ["Appointments", "/staff/appointments"]]
    : [["Dashboard", "/donor/dashboard"], ["Profile", "/donor/profile"], ["Book appointment", "/donor/book-appointment"], ["My appointments", "/donor/appointments"], ["Donation history", "/donor/donations"]];

  return (
    <header className="topbar">
      <Link to="/" className="brand"><span className="brand-icon">♥</span> LifeDrop</Link>
      <nav className="navlinks">
        {isAuthenticated ? links.map(([label, to]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? "navlink active" : "navlink"}>{label}</NavLink>) : <>
          <NavLink className="navlink" to="/donor/login">Donor login</NavLink>
          <NavLink className="navlink" to="/staff/login">Staff login</NavLink>
        </>}
      </nav>
      <div className="nav-user">
        {isAuthenticated ? <><span className="user-name">{user?.full_name}</span><button className="button button-outline button-small" onClick={() => { logout(); navigate("/"); }}>Log out</button></> : <Link className="button button-primary button-small" to="/donor/register">Become a donor</Link>}
      </div>
    </header>
  );
}
