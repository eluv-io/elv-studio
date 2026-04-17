// Parse JSON for input values
// -- Allows whitespace and blank
// -- Rejects quoted strings which JSON.parse allows (e.g. JSON.parse('"string"')
export const ParseInputJson = ({metadata, defaultValue = {}}: {metadata: unknown; defaultValue?: object}) => {
  if(typeof metadata === "string") {
    const trimmed = metadata.trim();

    if(trimmed === "") { return defaultValue; }

    if(!trimmed.startsWith("{") && !trimmed.startsWith("[")) { throw Error("Invalid JSON"); }

    try {
      return JSON.parse(trimmed);
    } catch(error) {
      throw Error(
        (error as Error).message
          .replace("JSON.parse: ", "")
          .replace("JSON Parse error: ", "")
          .replace(" of the JSON data", "")
      );
    }
  }

  return metadata || defaultValue;
};
