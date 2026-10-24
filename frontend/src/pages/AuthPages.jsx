import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { donorApi } from "../api/donorApi";
import { staffApi } from "../api/staffApi";
import { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Common";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function AuthLayout({ eyebrow, title, description, children, footer }) {
  return <main className="auth-page"><div className="auth-decoration"><div className="auth-cross">+</div><div className="auth-heart">♥</div><h2>Small acts of kindness can make a big difference.</h2><p>Thank you for being part of a caring community.</p></div><section className="auth-card"><div className="auth-mobile-brand">♥ LifeDrop</div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="auth-description">{description}</p>{children}{footer && <div className="auth-footer">{footer}</div>}</section></main>;
}

export function DonorRegister() {
  const [form, setForm] = useState({full_name:"",email:"",password:"",confirm_password:"",phone:"",blood_group:"",city_or_area:""});
  const [error,setError] = useState(""); const [success,setSuccess] = useState(""); const [busy,setBusy] = useState(false); const navigate = useNavigate();
  const change = (e) => setForm({...form,[e.target.name]:e.target.value});
  async function submit(e) {
    e.preventDefault(); setError(""); setSuccess("");
    if (form.password !== form.confirm_password) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
    setBusy(true);
    try {
      await donorApi.register({full_name:form.full_name.trim(),email:form.email.trim(),password:form.password,phone:form.phone.trim(),blood_group:form.blood_group,city_or_area:form.city_or_area.trim()});
      setSuccess("Registration successful. Redirecting to donor login...");
      setTimeout(() => navigate("/donor/login"), 900);
    } catch(err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthLayout eyebrow="JOIN THE COMMUNITY" title="Become a donor" description="Create your donor profile to book appointments and track donations." footer={<>Already registered? <Link to="/donor/login">Sign in</Link></>}>
    <Notice type="error">{error}</Notice><Notice type="success">{success}</Notice>
    <form className="form-stack" onSubmit={submit}>
      <label>Full name<input name="full_name" value={form.full_name} onChange={change} placeholder="e.g. Aisha Khan" required /></label>
      <label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label>
      <div className="form-row"><label>Password<input type="password" name="password" value={form.password} onChange={change} minLength="8" placeholder="At least 8 characters" required /></label><label>Confirm password<input type="password" name="confirm_password" value={form.confirm_password} onChange={change} placeholder="Repeat password" required /></label></div>
      <div className="form-row"><label>Phone number<input type="tel" name="phone" value={form.phone} onChange={change} placeholder="10-digit phone" required /></label><label>Blood group<select name="blood_group" value={form.blood_group} onChange={change} required><option value="">Select group</option>{BLOOD_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label></div>
      <label>City or area<input name="city_or_area" value={form.city_or_area} onChange={change} placeholder="e.g. Andheri" required /></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? "Creating account..." : "Create donor account →"}</button>
    </form>
  </AuthLayout>;
}

export function LoginPage({ role }) {
  const isStaff = role === "staff"; const api = isStaff ? staffApi : donorApi;
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await api.login({email:email.trim(),password});
      const user = login(response.data, role);
      if (user.role !== role && !(isStaff && user.role === "admin")) {
        setError("The account role does not match this login page. Please use the correct login.");
        return;
      }
      navigate(isStaff ? "/staff/dashboard" : "/donor/dashboard");
    } catch(err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthLayout eyebrow={isStaff ? "STAFF PORTAL" : "WELCOME BACK"} title={isStaff ? "Staff sign in" : "Donor sign in"} description={isStaff ? "Sign in to review and manage donor appointments." : "Sign in to view your profile and appointments."} footer={isStaff ? <>Need a staff account? <Link to="/staff/register">Register here</Link></> : <>New to LifeDrop? <Link to="/donor/register">Create an account</Link></>}>
    <Notice type="error">{error}</Notice>
    <form className="form-stack" onSubmit={submit}>
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required /></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? "Signing in..." : "Sign in →"}</button>
    </form>
  </AuthLayout>;
}

export function StaffRegister() {
  const [form,setForm] = useState({full_name:"",email:"",password:"",confirm_password:"",role:"staff"});
  const [error,setError] = useState(""); const [busy,setBusy] = useState(false); const [success,setSuccess] = useState(""); const navigate=useNavigate();
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  async function submit(e) {
    e.preventDefault();setError("");setSuccess("");
    if(form.password!==form.confirm_password)return setError("Passwords do not match.");
    if(form.password.length<8)return setError("Password must contain at least 8 characters.");
    setBusy(true);
    try { await staffApi.register({full_name:form.full_name.trim(),email:form.email.trim(),password:form.password,role:form.role});setSuccess("Staff registration successful. Redirecting to staff login...");setTimeout(()=>navigate("/staff/login"),900); }
    catch(err){setError(errorMessage(err));} finally{setBusy(false);}
  }
  return <AuthLayout eyebrow="TEAM ACCESS" title="Staff registration" description="Create a staff account to manage appointment requests." footer={<>Already registered? <Link to="/staff/login">Sign in</Link></>}>
    <Notice type="error">{error}</Notice><Notice type="success">{success}</Notice>
    <form className="form-stack" onSubmit={submit}>
      <label>Full name<input name="full_name" value={form.full_name} onChange={change} placeholder="Your full name" required /></label>
      <label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label>
      <div className="form-row"><label>Password<input type="password" name="password" value={form.password} onChange={change} minLength="8" required /></label><label>Confirm password<input type="password" name="confirm_password" value={form.confirm_password} onChange={change} required /></label></div>
      <label>Role<select name="role" value={form.role} onChange={change}><option value="staff">Staff</option><option value="admin">Admin</option></select></label>
      <p className="small-note">For this college demo, role selection follows the project brief. In a real system, admin registration should be restricted.</p>
      <button className="button button-primary button-full" disabled={busy}>{busy ? "Creating account..." : "Create staff account →"}</button>
    </form>
  </AuthLayout>;
}
