import {ActionIcon, Box, Code, Tooltip} from "@mantine/core";
import {CopyToClipboard} from "@/utils/helpers";
import {CopyIcon} from "@/assets/icons/index.tsx";
import {useState} from "react";
import styles from "./JSONView.module.css";

interface JSONViewProps {
  json: string;
  copyable?: boolean;
}

const JSONView = ({json, copyable=false}: JSONViewProps) => {
  const [copied, setCopied] = useState(false);

  return (
    <Box
      pos="relative"
    >
      <Code block className={styles.code} bg="elv-blue.0">
        <Box
          mih="1.5rem"
          p="0.5rem 2.75rem 0.5rem 1rem"
          m="1rem 0"
        >
          { json }
        </Box>
        {
          copyable &&
          (
            <Tooltip label={copied ? "Copied": "Copy"} position="bottom">
              <ActionIcon
                variant="transparent"
                pos="absolute"
                right="0.5rem"
                top="0.5rem"
                onClick={() => {
                  CopyToClipboard({text: json});
                  setCopied(true);

                  setTimeout(() => {
                    setCopied(false);
                  }, 3000);
                }}
              >
                <CopyIcon color="var(--mantine-color-elv-gray-6)" />
              </ActionIcon>
            </Tooltip>
          )
        }
      </Code>
    </Box>
  );
};

export default JSONView;
