import {
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Drawer,
  Typography,
} from "@mui/material";
import React from "react";

const SettingsDrawer = ({ toggleDrawer, setToggleDrawer, languageData }) => {
  const list = () => (
    <Box sx={{ width: 250, p: 1, m: 1 }} role="presentation">
      <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
        {languageData.appName}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        {languageData.langaugeTitle}: {languageData.language}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        {languageData.versionTitle}: {languageData.version}
      </Typography>
      <Divider />
      <List>
        {languageData.drawerList.map((each, index) => (
          <ListItem key={index}>{each}</ListItem>
        ))}
      </List>
    </Box>
  );
  return (
    <React.Fragment>
      <Drawer
        anchor={"right"}
        open={toggleDrawer}
        onClose={() => setToggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </React.Fragment>
  );
};

export default SettingsDrawer;
