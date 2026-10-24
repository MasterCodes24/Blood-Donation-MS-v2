import React from "react";
import { Link } from "react-router-dom";

export function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function Notice({ type = "info", children }) {
  if (!children) return null;
  return <div className={`notice notice-${type}`} role="status">{children}</div>;
}

export function EmptyState({ title, text, to, action }) {
  return <div className="empty-state"><div className="empty-icon">♡</div><h3>{title}</h3><p>{text}</p>{to && <Link className="button button-primary" to={to}>{action || "Get started"}</Link>}</div>;
}

export function Loading({ text = "Loading..." }) {
  return <div className="loading"><span className="spinner" />{text}</div>;
}

export function getRows(response) {
  const body = response?.data;
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.appointments)) return data.appointments;
  if (Array.isArray(data?.donations)) return data.donations;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

export function getObject(response) {
  const body = response?.data;
  return body?.data ?? body?.donor ?? body?.user ?? body ?? {};
}
