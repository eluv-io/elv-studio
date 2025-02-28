import {createTheme} from "@mantine/core";

const theme = createTheme({
  fontFamily: "Helvetica Neue, Helvetica, sans-serif",
  headings: {
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
  },
  primaryColor: "elv-blue",
  primaryShade: 5,
  colors: {
    "elv-blue": [
      "#ebf3fc", // eluvio color
      "#f8f9fd", // eluvio color
      "#a6bff6",
      "#228be6", // eluvio color
      "#3f85e3", // eluvio color
      "#336be4", // eluvio color
      "#2b6cfb", // eluvio color
      "#1351cb",
      "#0648b6",
      "#003ea2"
    ],
    "elv-violet": [
      "#f9e9ff",
      "#ebcfff",
      "#d29cff",
      "#b964ff", // eluvio color
      "#a437fe",
      "#971afe",
      "#9009ff",
      "#7c00e4",
      "#8f5aff", // eluvio color
      "#5f00b3",
      "#380c61", // eluvio color
    ],
    "elv-gray": [
      "#f5f5f5",
      "#f0f0f0",
      "#d7d7d7", // eluvio color
      "#bdbdbd", // eluvio color
      "rgba(0,0,0,0.06)", // eluvio color
      "#8b8b8b",
      "#848484",
      "#717171",
      "#4b494e", // eluvio color
      "#3c3c3c" // eluvio color
    ],
    "elv-black": [
      "#22252a", // eluvio color
      "#202020", // eluvio color
      "#1e1e1e" // eluvio color
    ],
    "elv-neutral": [
      "#eeeeee", // eluvio color
      "#ecece8", // eluvio color
      "#cdc8d3",
      "#b2aaba", // eluvio color
      "#a9a0b2", // eluvio color
      "#7b7580", // eluvio color
      "#847791",
      "#71667e",
      "#665972",
      "#594c66"
    ],
    "elv-red": [
      "#ffe9e6",
      "#ffd3cd",
      "#ffa69b",
      "#ff7663",
      "#ff4723", // eluvio color
      "#ff3418",
      "#ff2507",
      "#e41600",
      "#cc0e00",
      "#b20000"
    ]
  },
  components: {
    Anchor: {
      styles: () => ({
        root: {
          "textDecoration": "underline",
          "fontWeight": "700",
          "fontSize": "0.75rem"
        }
      })
    },
    AppShell: {
      styles: () => ({
        root: {
          "--app-shell-border-color": "var(--mantine-color-elv-neutral-0)"
        }
      })
    },
    Button: {
      styles: (theme, params) => ({
        root: {
          "borderRadius": "0",
          "minWidth": "7rem",
          "minHeight": "35px",
          ...(params.variant === "outline" && {
            "borderColor": "var(--mantine-color-elv-gray-3)",
            ...(params.disabled && {
              "backgroundColor": "transparent"
            })
          })
        },
        label: {
          "fontWeight": "400",
          ...(params.size === "sm" && {
            "fontSize": "calc(0.85rem * var(--mantine-scale)"
          }),
          ...(params.variant === "outline" && !params.disabled && {
            "color": "var(--mantine-color-elv-black-0)"
          })
        }
      })
    },
    Checkbox: {
      styles: () => ({
        input: {
          "--checkbox-color": "var(--mantine-color-elv-blue-3)",
          "borderRadius": "0"
        }
      })
    },
    Dropzone: {
      styles: () => ({
        root: {
          border: "none",
          borderRadius: "5px",
          backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4.5' stroke='%2334065F' stroke-width='2' stroke-dasharray='9%2c 9' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e\")"
        }
      })
    },
    Group: {
      styles: () => ({
        root: {
          "--mantine-spacing-xxs": "0.3125rem"
        }
      })
    },
    Indicator: {
      styles: () => ({
        root: {
          "lgg": "16px"
        }
      })
    },
    Modal: {
      styles: () => ({
        title: {
          "fontSize": "1.25rem"
        }
      })
    },
    NavLink: {
      styles: (theme, params) => ({
        root: {
          ...(params.active && {
            "backgroundColor": "var(--mantine-color-elv-blue-1)"
          })
        },
        label: {
          "fontSize": "16px",
          ...(params.active && {
            "color": "var(--mantine-color-elv-blue-3)"
          })
        }
      })
    },
    Radio: {
      styles: () => ({
        root: {
          "--radio-icon-size": "0.5rem",
        },
        radio: {
          "--radio-color": "var(--mantine-color-elv-blue-3)"
        }
      })
    },
    Select: {
      styles: () => ({
        input: {
          "borderRadius": "0"
        }
      })
    },
    Table: {
      vars: (theme, props) => {
        if(props.size === "xxs") {
          return {
            root: {
              "--text-fz": "0.75rem"
            }
          };
        }
      }
    },
    TextInput: {
      styles: () => ({
        input: {
          "borderRadius": "0"
        }
      })
    }
  }
});

export default theme;
