const styles = {
  requested: "status-yellow",
  approved: "status-green",
  rejected: "status-red",
  completed: "status-blue",
  cancelled: "status-gray",
};

export default function StatusBadge({ status = "requested" }) {
  const normalized = String(status).toLowerCase();
  return <span className={`status-badge ${styles[normalized] || "status-gray"}`}>{normalized}</span>;
}
