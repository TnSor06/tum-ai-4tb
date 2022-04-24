import * as React from "react";
import { AppBar, Box, Toolbar, Typography, IconButton } from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import { SettingsContext } from "../../providers/settings.provider";
import SettingsDrawer from "./settings-drawer.component";

export default function Header() {
  const { languageData } = React.useContext(SettingsContext);
  const [toggleDrawer, setToggleDrawer] = React.useState(false);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {languageData.appName}
          </Typography>
          <IconButton
            color="inherit"
            size="large"
            aria-label={languageData.settings}
            onClick={() => {
              setToggleDrawer(!toggleDrawer);
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SettingsDrawer
        toggleDrawer={toggleDrawer}
        setToggleDrawer={setToggleDrawer}
        languageData={languageData}
      ></SettingsDrawer>
    </Box>
  );
}
