import {createTheme} from "@mantine/core";

const theme = createTheme({
  fontFamily: "Helvetica Neue, Helvetica, sans-serif",
  headings: {
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
  },
  scale: 1,
  colors: {
    "elv-blue": [
      "#ebf3fc", // eluvio color
      "#f8f9fd", // eluvio color
      "#a6bff6",
      "#228be6", // eluvio color
      "#3f85e3", // eluvio color
      "#336be4", // eluvio color
      "#2361e3",
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
      "#6b6b6b", // eluvio color
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
    "elv-orange": [
      "#fff6e1",
      "#ffeccc",
      "#ffd79b",
      "#ffc164",
      "#ffae38",
      "#ffa31b",
      "#f90", // eluvio color
      "#e38800",
      "#ca7800",
      "#b06700"
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
    ],
    "elv-yellow": [
      "#fffde2",
      "#fffacc",
      "#fff59b",
      "#ffef64",
      "#ffeb39",
      "#ffe81d",
      "#ffe607", // eluvio color
      "#e3cc00",
      "#c9b500",
      "#ad9c00"
    ],
    "elv-green": [
      "#e4fdf4",
      "#d6f6e8",
      "#b0e8d1",
      "#88dab8",
      "#66cfa3",
      "#57ca9a", // eluvio color
      "#41c48f",
      "#30ad7a",
      "#249a6b",
      "#0b865a"
    ]
  },
  components: {
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
          backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23380c61' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")"
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
        root: {
          "--modal-size-xxl": "calc(55.75rem * var(--mantine-scale))"
        },
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
