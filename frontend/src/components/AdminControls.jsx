function AdminControls({ userRole, children }) {
  const isAdmin =
    typeof userRole === "string" &&
    userRole.trim().toLowerCase() === "admin";

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-controls">
      {children}
    </div>
  );
}

export default AdminControls;
