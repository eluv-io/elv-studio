import {ActionIcon, Box, Flex, Text, Tooltip} from "@mantine/core";
import {CopyIcon} from "@/assets/icons/index.jsx";
import {useClipboard} from "@mantine/hooks";
import LinkIcon from "@/assets/icons/LinkIcon.jsx";

const Action = ({label, onClick, Icon, href}) => {
  const actionProps = {};

  if(href) {
    actionProps.component = "a";
    actionProps.href = href;
    actionProps.target = "_blank";
  } else {
    actionProps.onClick = onClick;
  }

  return (
    <Tooltip
      label={label}
      withArrow
      position="right"
    >
      <ActionIcon
        {...actionProps}
        size="xs"
        variant="transparent"
        color="elv-gray.1"
      >
        { Icon }
      </ActionIcon>
    </Tooltip>
  );
};

export const DetailRow = ({
  indent=false,
  label,
  value,
  copyable,
  onClick,
  clickTitle,
  href,
  Icon,
  mb=8
}) => {
  const clipboard = useClipboard();

  const HandleClick = copyable ?
    () => clipboard.copy(value) :
    () => onClick();

  const actionLabel = copyable ?
    (
      clipboard.copied ? "Copied" : "Copy"
    ) :
    (clickTitle || label);

  if(copyable) {
    Icon = <CopyIcon color="var(--mantine-color-elv-neutral-5)" />;
  } else if(href || onClick) {
    Icon = <LinkIcon color="var(--mantine-color-elv-neutral-5)" />;
  }

  return (
    <Box style={{marginLeft: indent ? "1.5rem" : 0, width: indent ? "calc(100% - 1.5rem)" : "100%"}}>
      <Flex
        gap={8}
        mb={mb}
        w="100%"
      >
        <Text
          fw={700}
          fz={14}
          pr="0.5rem"
          wrap="no-wrap"
          style={{whiteSpace: "nowrap"}}
        >
          { `${label}:` }
        </Text>
        <Text truncate="end" fz={14} fw={400} maw={copyable ? "60%" : "100%"}>
          { value || "" }
        </Text>
        {
          (copyable && value || onClick || href) &&
          <Action
            label={actionLabel}
            onClick={HandleClick}
            Icon={Icon}
            href={href}
          />
        }
      </Flex>
    </Box>
  );
};

export default DetailRow;
