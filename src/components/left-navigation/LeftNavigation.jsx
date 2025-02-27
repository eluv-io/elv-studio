import {AppShell, NavLink} from "@mantine/core";
import styles from "@/components/left-navigation/LeftNavigation.module.css";
import {useLocation, useNavigate} from "react-router-dom";

const LeftNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_LINKS = [
    {path: "/new", label: "Create"},
    {path: "/jobs", label: "Jobs"}
  ];

  return (
    <AppShell.Navbar p="24 14">
      {
        NAV_LINKS.map(({path, label}) => (
          <NavLink
            key={`navigation-link-${path}`}
            href="#"
            label={label}
            onClick={() => navigate("/")}
            title={label}
            active={path === location.pathname}
            to={"/new"}
            classNames={{
            root: styles.root,
            label: styles.label,
            section: styles.section
          }}
          />
        ))
      }
    </AppShell.Navbar>
  );
};

export default LeftNavigation;
