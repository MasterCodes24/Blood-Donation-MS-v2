import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { donorApi } from "../api/donorApi";
import { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { EmptyState, getObject, getRows, Loading, Notice, PageTitle } from "../components/Common";
import StatusBadge from "../components/StatusBadge";

const GROUPS=["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const dateText=(value)=>value ? new Date(value).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : "—";

export function DonorDashboard() {
  const {user}=useAuth(); const [appointments,setAppointments]=useState([]); const [donations,setDonations]=useState([]); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([donorApi.appointments(),donorApi.donations()]).then(([a,d])=>{setAppointments(getRows(a));setDonations(getRows(d));}).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false));},[]);
  return <main className="content-page">
    <PageTitle eyebrow="DONOR DASHBOARD" title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!`} description="Your kindness can make a real difference. Here's your donation overview." />
    <Notice type="error">{error}</Notice>
    <div className="dashboard-banner"><div><div className="eyebrow">YOUR NEXT STEP</div><h2>Every donation starts with an appointment.</h2><p>Choose a future date and keep track of your request here.</p><Link to="/donor/book-appointment" className="button button-light">Book an appointment →</Link></div><div className="banner-heart">♥</div></div>
    {loading ? <Loading text="Loading your overview..." /> : <div className="stats-grid"><div className="stat-card"><span className="stat-icon">▦</span><span className="stat-label">Total appointments</span><strong>{appointments.length}</strong><small>All your requests</small></div><div className="stat-card"><span className="stat-icon">♥</span><span className="stat-label">Total donations</span><strong>{donations.length}</strong><small>Recorded donations</small></div><div className="stat-card"><span className="stat-icon">◷</span><span className="stat-label">Pending requests</span><strong>{appointments.filter(a=>a.status==="requested").length}</strong><small>Awaiting staff review</small></div></div>}
    <div className="quick-links"><h2>Quick links</h2><div className="quick-grid"><Link to="/donor/profile" className="quick-card"><span>♙</span><div><strong>My profile</strong><small>View or update your details</small></div><b>→</b></Link><Link to="/donor/appointments" className="quick-card"><span>▤</span><div><strong>My appointments</strong><small>Check appointment status</small></div><b>→</b></Link><Link to="/donor/donations" className="quick-card"><span>♥</span><div><strong>Donation history</strong><small>Review recorded donations</small></div><b>→</b></Link></div></div>
  </main>;
}

export function DonorProfile() {
  const [profile,setProfile]=useState({full_name:"",email:"",phone:"",blood_group:"",city_or_area:""});const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");
  useEffect(()=>{donorApi.me().then(r=>{const d=getObject(r);setProfile({full_name:d.full_name||"",email:d.email||"",phone:d.phone||"",blood_group:d.blood_group||"",city_or_area:d.city_or_area||""});}).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false));},[]);
  async function submit(e){e.preventDefault();setError("");setSuccess("");setBusy(true);try{await donorApi.update({phone:profile.phone,blood_group:profile.blood_group,city_or_area:profile.city_or_area});setSuccess("Profile updated successfully.");}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <main className="content-page narrow-page"><PageTitle eyebrow="YOUR ACCOUNT" title="My profile" description="Keep your contact details up to date."/><Notice type="error">{error}</Notice><Notice type="success">{success}</Notice>{loading?<Loading/>:<section className="panel"><form className="form-stack" onSubmit={submit}><label>Full name<input value={profile.full_name} disabled /></label><label>Email address<input type="email" value={profile.email} disabled /><small className="field-help">Email cannot be changed here.</small></label><label>Phone number<input type="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} required /></label><label>Blood group<select value={profile.blood_group} onChange={e=>setProfile({...profile,blood_group:e.target.value})} required><option value="">Select group</option>{GROUPS.map(g=><option key={g}>{g}</option>)}</select></label><label>City or area<input value={profile.city_or_area} onChange={e=>setProfile({...profile,city_or_area:e.target.value})} required /></label><button className="button button-primary" disabled={busy}>{busy?"Saving...":"Save changes"}</button></form></section>}</main>;
}

export function BookAppointment() {
  const [date,setDate]=useState("");const [error,setError]=useState("");const [success,setSuccess]=useState("");const [busy,setBusy]=useState(false);
  const today=new Date();const minDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  async function submit(e){e.preventDefault();setError("");setSuccess("");if(!date||date<=minDate)return setError("Please choose a future date.");setBusy(true);try{await donorApi.bookAppointment({appointment_date:date});setSuccess("Appointment requested successfully. You can see its status under My Appointments.");setDate("");}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <main className="content-page narrow-page"><PageTitle eyebrow="PLAN YOUR DONATION" title="Book an appointment" description="Choose a date in the future. Your request will be sent to staff for review."/><Notice type="error">{error}</Notice><Notice type="success">{success}</Notice><section className="panel appointment-panel"><div className="panel-icon">▦</div><h2>Choose your date</h2><p>Once submitted, you can track whether your appointment is requested, approved, or rejected.</p><form className="form-stack" onSubmit={submit}><label>Appointment date<input type="date" min={minDate} value={date} onChange={e=>setDate(e.target.value)} required /></label><button className="button button-primary button-full" disabled={busy}>{busy?"Submitting request...":"Request appointment →"}</button></form></section></main>;
}

export function DonorAppointments() {
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{donorApi.appointments().then(r=>setRows(getRows(r))).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false));},[]);
  return <main className="content-page"><PageTitle eyebrow="YOUR ACTIVITY" title="My appointments" description="Track the status of your appointment requests." action={<Link className="button button-primary" to="/donor/book-appointment">+ Book appointment</Link>}/><Notice type="error">{error}</Notice>{loading?<Loading/>:rows.length===0?<EmptyState title="No appointments yet" text="When you book an appointment, it will appear here." to="/donor/book-appointment" action="Book an appointment"/>:<div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Appointment date</th><th>Status</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.appointment_id||i}><td>{dateText(r.appointment_date)}</td><td><StatusBadge status={r.status}/></td></tr>)}</tbody></table></div></div>}</main>;
}

export function DonorDonationHistory() {
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{donorApi.donations().then(r=>setRows(getRows(r))).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false));},[]);
  return <main className="content-page"><PageTitle eyebrow="YOUR IMPACT" title="Donation history" description="Your completed donations recorded by staff."/><Notice type="error">{error}</Notice>{loading?<Loading/>:rows.length===0?<EmptyState title="No donation history yet." text="Completed donations will appear here after staff records them."/>:<div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Donation date</th><th>Appointment date</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.donation_id||i}><td>{dateText(r.donation_date)}</td><td>{dateText(r.appointment_date)}</td></tr>)}</tbody></table></div></div>}</main>;
}
