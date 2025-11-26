import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: {
      default: "#f3f4f6",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ["system-ui", "Roboto", "sans-serif"].join(","),
  },
});

export default theme;
