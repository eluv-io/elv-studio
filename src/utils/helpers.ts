import {LogError} from "./errors";

interface CopyToClipboardParams {
  text: string;
}

const FallbackCopyToClipboard = ({text}: CopyToClipboardParams) => {
  const element = document.createElement("textarea");
  element.value = text;
  (element.style as any).all = "unset";
  // Avoid screen readers from reading text out loud
  element.ariaHidden = "true";
  // used to preserve spaces and line breaks
  element.style.whiteSpace = "pre";
  // do not inherit user-select (it may be `none`)
  (element.style as any).webkitUserSelect = "text";
  (element.style as any).MozUserSelect = "text";
  (element.style as any).msUserSelect = "text";
  element.style.userSelect = "text";

  document.body.appendChild(element);
  element.focus();
  element.select();

  try {
    document.execCommand("copy");
    document.body.removeChild(element);
  } catch(error) {
    LogError("Unable to copy to clipboard", error);
  }
};

export const CopyToClipboard = ({text}: CopyToClipboardParams) => {
  if(!navigator.clipboard) {
    FallbackCopyToClipboard({text});
    return;
  }

  navigator.clipboard.writeText(text)
    .catch(error => {
      if(error instanceof DOMException && error.name === "NotAllowedError") {
        FallbackCopyToClipboard({text});
      } else {
        LogError("Unable to copy to clipboard", error);
      }
    });
};

interface SortStatus {
  columnAccessor: string;
  direction: "asc" | "desc";
}

interface SortTableParams {
  sortStatus: SortStatus;
   
  AdditionalCondition?: (a: any, b: any) => number | undefined;
}

export const SortTable = ({sortStatus, AdditionalCondition}: SortTableParams) => {
  return (a: any, b: any) => {
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
