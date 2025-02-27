import {Title} from "@mantine/core";

const FormSectionTitle = ({title}) => {
  return (

    <Title
      c="elv-gray.8"
      mb={12}
      order={3}
    >
      { title }
    </Title>
  );
};

export default FormSectionTitle;
