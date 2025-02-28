import {Title} from "@mantine/core";

const FormSectionTitle = ({title}) => {
  return (

    <Title
      c="elv-gray.9"
      mb={12}
      size={20}
      order={3}
      fw={600}
    >
      { title }
    </Title>
  );
};

export default FormSectionTitle;
