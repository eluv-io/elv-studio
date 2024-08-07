import {observer} from "mobx-react-lite";
import {Accordion} from "@mantine/core";
import {useState} from "react";

const AdvancedSection = observer(({
  children
}) => {
  const [value, setValue] = useState("");

  return (
    <Accordion
      title="Advanced Settings"
      id="advanced-section"
      multiple={false}
      value={value}
      onChange={setValue}
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
