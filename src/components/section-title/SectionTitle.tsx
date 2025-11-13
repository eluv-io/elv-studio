import {BoxProps, Title} from "@mantine/core";
import styles from "./SectionTitle.module.css";
import {ReactNode} from "react";

interface SectionTitleProps {
  mb?: BoxProps["mb"];
  children: ReactNode;
}

const SectionTitle = ({mb=0, children}: SectionTitleProps) => {
  return (

    <Title
      c="elv-blue.3"
      mb={mb}
      order={2}
      className={styles.title}
    >
      { children }
    </Title>
  );
};

export default SectionTitle;
