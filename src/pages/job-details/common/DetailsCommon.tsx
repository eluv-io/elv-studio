import {ActionIcon, Box, BoxProps, Flex, Text, Title, Tooltip} from "@mantine/core";
import {CopyIcon} from "@/assets/icons/index.tsx";
import {useClipboard} from "@mantine/hooks";
import LinkIcon from "@/assets/icons/LinkIcon.tsx";
import {ReactNode} from "react";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  Icon: ReactNode;
  href?: string;
}

const Action = ({label, onClick, Icon, href}: ActionButtonProps) => {
  let actionProps: {
    component?: "a";
    href?: string;
    target?: string;
    onClick?: () => void;
  };

  if(href) {
    actionProps = {
      component: "a",
      href,
      target: "_blank"
    };
  } else {
    actionProps = {
      onClick
    };
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

interface DetailRowProps {
  indent?: boolean;
  label: string;
  value: string;
  copyable?: boolean;
  onClick?: () => void;
  clickTitle?: string;
  href?: string;
  Icon?: ReactNode;
  mb?: BoxProps["mb"]
}

export const DetailRow = ({
  indent=false,
  label,
  value,
  copyable,
  onClick,
  clickTitle,
  href,
  Icon,
  mb=5
}: DetailRowProps) => {
  const clipboard = useClipboard();

  const HandleClick = copyable ?
    () => clipboard.copy(value) :
    (onClick ? () => onClick() : undefined);

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
        <Title
          order={3}
          c="elv-gray.9"
          pr="0.5rem"
          style={{whiteSpace: "nowrap"}}
        >
          { `${label}:` }
        </Title>
        <Text truncate="end" fz={14} fw={500} c="elv-gray.9" maw={"100%"}>
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
