import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

const Spinner = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
      }}
    >
      <CircularProgress color="inherit" />
      <Typography variant="overline" display="block" gutterBottom>
        {message}
      </Typography>
    </Box>
  );
};

export default Spinner;
