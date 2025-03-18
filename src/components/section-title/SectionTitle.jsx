import {Title} from "@mantine/core";
import styles from "./SectionTitle.module.css";

const SectionTitle = ({mb=0, children}) => {
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
