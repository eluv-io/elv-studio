const FallbackCopyToClipboard = ({text}) => {
  const element = document.createElement("textarea");
  element.value = text;
  element.style.all = "unset";
  // Avoid screen readers from reading text out loud
  element.ariaHidden = "true";
  // used to preserve spaces and line breaks
  element.style.whiteSpace = "pre";
  // do not inherit user-select (it may be `none`)
  element.style.webkitUserSelect = "text";
  element.style.MozUserSelect = "text";
  element.style.msUserSelect = "text";
  element.style.userSelect = "text";

  document.body.appendChild(element);
  element.focus();
  element.select();

  try {
    document.execCommand("copy");
    document.body.removeChild(element);
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error("Unable to copy to clipboard", error);
  }
};

export const CopyToClipboard = ({text}) => {
  if(!navigator.clipboard) {
    FallbackCopyToClipboard({text});
    return;
  }

  navigator.clipboard.writeText(text)
    .catch(error => {
      if(error instanceof DOMException && error.name === "NotAllowedError") {
        FallbackCopyToClipboard({text});
      } else {
        // eslint-disable-next-line no-console
        console.error("Unable to copy to clipboard", error);
      }
    });
};

export const SortTable = ({sortStatus, AdditionalCondition}) => {
  return (a, b) => {
    if(AdditionalCondition && typeof AdditionalCondition(a, b) !== "undefined") {
      return AdditionalCondition(a, b);
    }

    a = a[sortStatus.columnAccessor]?.trim();
    b = b[sortStatus.columnAccessor]?.trim();

    if(typeof a === "number" && typeof b === "number") {
      a = isNaN(a) ? 0 : a;
      b = isNaN(b) ? 0 : b;
    } else {
      a = typeof a === "string" ? a.toLowerCase() : a ?? "";
      b = typeof b === "string" ? b.toLowerCase() : b ?? "";
    }

    if(a === b) { return 0; }

    return (a < b ? -1 : 1) * (sortStatus.direction === "asc" ? 1 : -1);
  };
};
