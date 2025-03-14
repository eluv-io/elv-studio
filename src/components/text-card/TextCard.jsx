import {Box, Flex, Group, Progress, Text} from "@mantine/core";

const TextCard = ({title, message, rightSection, complete=false, percentage}) => {
  return (
    <Box
      bg={complete ? "elv-blue.0" : "white"}
      bd="1px solid var(--mantine-color-elv-gray-0)"
      mb={16}
      p="9px 12px"
      style={{borderRadius: "6px"}}
      pos="relative"
    >
      {
        (percentage && typeof percentage === "number") ?
        <Progress
          value={percentage}
          color="elv-blue.0"
          bg="white"
          pos="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          style={{zIndex: 0}}
        /> : null
      }
      <Flex align="center" direction="row" pos="relative" style={{zIndex: 1}}>
        <Group gap={0}>
          {
            title &&
            <Text c="elv-gray.6" fw={500}>{ title }</Text>
          }
          {
            message &&
            <Text fw={500} c="elv-gray.6">
              { message }
            </Text>
          }
        </Group>
        {
          rightSection &&
          <Flex ml="auto">
            { rightSection }
          </Flex>
        }
      </Flex>
    </Box>
  );
};

export default TextCard;
