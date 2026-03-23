import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">DepMonitor</div>

      <NavLink to="/" end className="nav-item">
        Dashboard
      </NavLink>

      <NavLink to="/projects" className="nav-item">
        Projects
      </NavLink>

      <NavLink to="/dependencies" className="nav-item">
        Dependencies
      </NavLink>

      <NavLink to="/vulnerabilities" className="nav-item">
        Vulnerabilities
      </NavLink>

      <NavLink to="/alerts" className="nav-item">
        Alerts
      </NavLink>

      <NavLink to="/settings" className="nav-item">
        Settings
      </NavLink>
    </div>
  );
}

export default Sidebar;
