import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { SettingsContext } from "./settings.provider";
import Slider from "@mui/material/Slider";

export function LanguageSelect({ name, formTitle }) {
  const { languageList, changeLanguage, currentLanguage, languageData } =
    React.useContext(SettingsContext);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(currentLanguage);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  return (
    <>
      <Button color="inherit" onClick={handleClickOpen}>
        {name}
      </Button>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>{formTitle}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel htmlFor={formTitle}>{name}</InputLabel>
              <Select
                native
                value={value}
                onChange={handleChange}
                input={<OutlinedInput label={name} id={formTitle} />}
              >
                {languageList.map((each, index) => (
                  <option key={index} value={each}>
                    {each}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            {languageData.cancel}
          </Button>
          <Button
            color="inherit"
            onClick={(e, reason) => {
              changeLanguage(value);
              handleClose(e, reason);
            }}
          >
            {languageData.submit}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function CountDownSlider({ name, formTitle }) {
  const { countdownTimer, changeCountdownTimer, languageData } =
    React.useContext(SettingsContext);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(countdownTimer);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  function valueLabelFormat(value) {
    return `${value} seconds`;
  }

  return (
    <>
      <Button color="inherit" onClick={handleClickOpen}>
        {name}
      </Button>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>{formTitle}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel htmlFor={formTitle}>{value}</InputLabel>
              <Slider
                value={value}
                min={1}
                step={2}
                max={20}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                onChange={handleChange}
                aria-labelledby={formTitle}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            {languageData.cancel}
          </Button>
          <Button
            color="inherit"
            onClick={(e, reason) => {
              changeCountdownTimer(value);
              handleClose(e, reason);
            }}
          >
            {languageData.submit}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
