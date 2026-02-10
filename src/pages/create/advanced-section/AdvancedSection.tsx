import {observer} from "mobx-react-lite";
import {Accordion} from "@mantine/core";
import {ReactNode, useState} from "react";
import PlusIcon from "@/assets/icons/PlusIcon.tsx";

interface AdvancedSectionProps {
  children: ReactNode;
}

const AdvancedSection = observer(({
  children
}: AdvancedSectionProps) => {
  const [value, setValue] = useState("");

  return (
    <Accordion
      title="Advanced Settings"
      id="advanced-section"
      multiple={false}
      value={value}
      onChange={() => setValue}
      chevron={<PlusIcon />}
    >
      <Accordion.Item value="advanced-item">
        <Accordion.Control>Advanced Settings</Accordion.Control>
        <Accordion.Panel>
          { children }
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
});

export default AdvancedSection;
