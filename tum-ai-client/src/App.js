import { Container } from "@mui/material";
import React from "react";
import "./App.css";
import Camera from "./components/camera/camera.component";
import Header from "./components/header/header.component";
import Spinner from "./components/spinner/spinner.component";
import { OpenCVContext } from "./providers/opencv.provider";
import { SettingsContext } from "./providers/settings.provider";

function App() {
  const { currentLanguage, changeLanguage } = React.useContext(SettingsContext);
  const { isLoading } = React.useContext(OpenCVContext);
  React.useEffect(() => {
    document.documentElement.setAttribute(
      "lang",
      currentLanguage.toLowerCase()
    );
  }, [changeLanguage]);

  return (
    <>
      <Header></Header>
      {isLoading ? (
        <Spinner message={"Loading Scripts"}></Spinner>
      ) : (
        <Container disableGutters maxWidth="lg">
          <Camera></Camera>
        </Container>
      )}
    </>
  );
}

export default App;
