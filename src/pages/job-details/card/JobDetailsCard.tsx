import {ActionIcon, Anchor, Button, Flex, Text, Tooltip} from "@mantine/core";
import {CopyToClipboard} from "@/utils/helpers.js";
import {CopyIcon} from "@/assets/icons/index.tsx";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import styles from "./JobDetailsCard.module.css";

const ActionText = ({value, onClick}) => {
  return (
    <Flex maw="100%">
      <Button
        variant="transparent"
        onClick={() => onClick()}
        pl={0}
      >
        <Text truncate="end">{ value }</Text>
      </Button>
    </Flex>
  );
};

const LinkText = ({value}) => {
  return (
    <Flex maw="100%">
      <Anchor href={value} target="_blank" classNames={{root: styles.link}} w="100%">
        <Text truncate="end">{ value }</Text>
      </Anchor>
    </Flex>
  );
};

const CopyText = ({value}) => {
  const [copied, setCopied] = useState(false);

  return (
    <Flex direction="row" align="center" gap={10} w="100%">
      <Text truncate="end">
        { value }
      </Text>
      <Tooltip label={copied ? "Copied": "Copy"} position="right">
        <ActionIcon
          variant="transparent"
          onClick={() => {
            CopyToClipboard({text: value});
            setCopied(true);

            setTimeout(() => {
              setCopied(false);
            }, [3000]);
          }}
        >
          <CopyIcon color="var(--mantine-color-elv-neutral-5)" />
        </ActionIcon>
      </Tooltip>
    </Flex>
  );
};

const PlainText = ({value}) => {
  return (
    <Text>{ value }</Text>
  );
};

const JobDetailsCard = observer(({
  label,
  value,
  secondary = false,
  type,
  onClick
}) => {
  const TYPE_MAP = {
    "TEXT": <PlainText value={value} />,
    "LINK": <LinkText value={value} />,
    "ACTION": <ActionText onClick={() => onClick()} value={value} />,
    "COPY": <CopyText value={value} />
  };

  return (
    <Flex
      bd={secondary ? "1px solid var(--mantine-color-elv-gray-2)" : "none"}
      bg={secondary ? "transparent" : "var(--mantine-color-elv-gray-1)"}
      mb={16}
      p="1.5rem 1rem"
      w="100%"
      align="center"
      className={styles.card}
    >
      <Flex w="100%" gap={0} direction="column">
        <Text>{ label }</Text>
        { TYPE_MAP[type] }
      </Flex>
    </Flex>
  );
});

export default JobDetailsCard;
