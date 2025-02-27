import {AppShell, NavLink} from "@mantine/core";
import {useLocation, useNavigate} from "react-router-dom";
import styles from "./SideNavigation.module.css";
import {CubeIcon, CubePlusIcon} from "@/assets/icons/index.jsx";

const NAV_LINKS = [
  {path: "/new", icon: <CubePlusIcon />, label: "Create"},
  {path: "/jobs", icon: <CubeIcon />, label: "Jobs"},
];

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="24 14">
      {
        NAV_LINKS.map(({path, icon, label}) => (
          <NavLink
            key={`navigation-link-${path}`}
            classNames={{
              root: styles.root,
              label: styles.label,
              section: styles.section
            }}
            href="#"
            label={label}
            leftSection={icon}
            onClick={() => navigate(path)}
            title={label}
            active={path === location.pathname}
          />
        ))
      }
    </AppShell.Navbar>
  );
};

export default SideNavigation;
