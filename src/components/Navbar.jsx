import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const links = [
  { to: "/",         label: "Dashboard"  },
  { to: "/projects", label: "Projects"   },
  { to: "/predict",  label: "Predict"    },
  { to: "/hotspots", label: "Hotspots"   },
  { to: "/upload",   label: "Upload"     },
];

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>⚡ POWERGRID Intelligence</span>
      <ul className={styles.links}>
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
