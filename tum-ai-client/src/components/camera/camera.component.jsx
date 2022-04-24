import { Box, Modal, Grid, Paper, IconButton, Typography } from "@mui/material";
import React from "react";
import Webcam from "react-webcam";

import SwitchCameraIcon from "@mui/icons-material/SwitchCamera";
import CameraIcon from "@mui/icons-material/Camera";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Spinner from "../spinner/spinner.component";
import { OpenCVContext } from "../../providers/opencv.provider";
import { SettingsContext } from "../../providers/settings.provider";

const FACING_MODE = {
  USER: "user",
  ENVIRONMENT: "environment",
};

function getOperatingSystem(window) {
  let operatingSystem = "Not known";
  if (window.navigator.appVersion.indexOf("Win") !== -1) {
    operatingSystem = "Windows OS";
  }
  if (window.navigator.appVersion.indexOf("Mac") !== -1) {
    operatingSystem = "MacOS";
  }
  if (window.navigator.appVersion.indexOf("X11") !== -1) {
    operatingSystem = "UNIX OS";
  }
  if (window.navigator.appVersion.indexOf("Linux") !== -1) {
    operatingSystem = "Linux OS";
  }

  return operatingSystem;
}

function getBrowser(window) {
  let currentBrowser = "Not known";
  if (window.navigator.userAgent.indexOf("Chrome") !== -1) {
    currentBrowser = "Google Chrome";
  } else if (window.navigator.userAgent.indexOf("Firefox") !== -1) {
    currentBrowser = "Mozilla Firefox";
  } else if (window.navigator.userAgent.indexOf("MSIE") !== -1) {
    currentBrowser = "Internet Exployer";
  } else if (window.navigator.userAgent.indexOf("Edge") !== -1) {
    currentBrowser = "Edge";
  } else if (window.navigator.userAgent.indexOf("Safari") !== -1) {
    currentBrowser = "Safari";
  } else if (window.navigator.userAgent.indexOf("Opera") !== -1) {
    currentBrowser = "Opera";
  } else if (window.navigator.userAgent.indexOf("Opera") !== -1) {
    currentBrowser = "YaBrowser";
  } else {
    console.log("Others");
  }

  return currentBrowser;
}

export const OS = (window) => getOperatingSystem(window);
export const currentBrowser = (window) => getBrowser(window);

const Camera = () => {
  const { countdownTimer, changeCountdownTimer } =
    React.useContext(SettingsContext);
  const [counter, setCounter] = React.useState(countdownTimer);
  const [counterActive, setCounterActive] = React.useState(false);

  React.useEffect(() => {
    const currentOS = OS(window);
    const browser = currentBrowser(window);
    if (currentOS !== "MacOS" || browser !== "Safari") {
      const timer = setInterval(() => {
        setFlashSrc(webcamRef.current.getScreenshot());
      }, 5000);
      return () => {
        clearInterval(timer);
      };
    } else {
      torchSupported(false);
      console.log(currentOS, browser, " has no Support of flash");
    }
  });

  React.useEffect(() => {
    setCounter(countdownTimer);
  }, [changeCountdownTimer]);

  const startTimer = () => {
    let count = countdownTimer;
    setCounterActive(true);
    const timer = setInterval(() => {
      count = count - 1;
      setCounter(count);
      if (count === 0) {
        clearInterval(timer);
        setImgCaptured(true);
        setImgSrc(webcamRef.current.getScreenshot());
        resetTimer();
      }
    }, 1000);
  };

  const resetTimer = () => {
    setCounter(countdownTimer);
    setCounterActive(false);
  };

  const { openCv } = React.useContext(OpenCVContext);

  const [cameraLoading, setCameraLoading] = React.useState(true);
  const [flashSupported, setFlashSupported] = React.useState(true);
  const [flash, setFlash] = React.useState(false);

  const webcamRef = React.useRef(null);
  const [currentFacingMode, setFacingMode] = React.useState(
    FACING_MODE.ENVIRONMENT
  );

  const imgRef = React.useRef(null);
  const outputRef = React.useRef(null);
  const flashRef = React.useRef(null);
  const [imgCaptured, setImgCaptured] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [flashSrc, setFlashSrc] = React.useState(null);

  const [devices, setDevices] = React.useState([]);

  const capture = () => {
    startTimer();
  };

  const torchSupported = React.useCallback(() => {
    if (webcamRef.current !== null) {
      const track = webcamRef.current.stream
        ? webcamRef.current.stream.getVideoTracks()[0]
        : null;
      if (track) {
        //Create image capture object and get camera capabilities
        const imageCapture = new ImageCapture(track);
        imageCapture.getPhotoCapabilities().then((capabilities) => {
          const torchSupported =
            !!capabilities.torch ||
            ("fillLightMode" in capabilities &&
              capabilities.fillLightMode.length !== 0 &&
              capabilities.fillLightMode !== "none");

          if (torchSupported) {
            setFlashSupported(true);
          } else {
            setFlashSupported(false);
          }
        });
      }
    }
  }, []);

  const switchCamera = () => {
    if (devices.length > 1) {
      setFacingMode(
        currentFacingMode === FACING_MODE.USER
          ? FACING_MODE.ENVIRONMENT
          : FACING_MODE.USER
      );
    }
  };

  const setTorch = () => {
    //Create image capture object and get camera capabilities
    if (webcamRef.current !== null) {
      // https://jsfiddle.net/makhalin/nzw5tv1q/
      const track = webcamRef.current.stream.getVideoTracks()[0];
      try {
        track.applyConstraints({
          facingMode: currentFacingMode,
          screenshotQuality: 1.0,
          advanced: [
            {
              torch: !flash,
            },
          ],
        });
      } catch (err) {
        console.log("Error seting flash", err);
      }
      setFlash(!flash);
    }
  };

  const handleDevices = React.useCallback(
    (mediaDevices) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
      setCameraLoading(false);
    },
    [setDevices]
  );

  React.useEffect(() => {
    if (
      !("mediaDevices" in navigator) ||
      !("getUserMedia" in navigator.mediaDevices)
    ) {
      alert("Camera not supported!");
    }
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
    // navigator.mediaDevices
    //   .getUserMedia({ audio: false, video: true })
    //   .then(() => {
    //     navigator.mediaDevices.enumerateDevices().then(handleDevices);
    //   })
    //   .catch((error) => {
    //     console.log("Error :", error);
    //   });
  }, [handleDevices]);

  React.useEffect(() => {
    torchSupported();
  }, [switchCamera]);

  return (
    <>
      {cameraLoading ? (
        <Spinner message={"Loading Camera"}></Spinner>
      ) : (
        <>
          <Grid container item spacing={0} xs={12} md={6}>
            <Grid item xs={12}>
              <Paper variant="outlined" square>
                <Webcam
                  muted={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%", height: "auto" }}
                  audio={false}
                  videoConstraints={{
                    facingMode: currentFacingMode,
                    screenshotQuality: 1.0,
                  }}
                  onClick={capture}
                ></Webcam>
              </Paper>
            </Grid>
            <Grid
              container
              spacing={0}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {devices.length > 1 ? (
                <Grid item xs={4}>
                  <Paper
                    variant="outlined"
                    square
                    color="dark"
                    sx={{
                      width: "100%",
                      height: "auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <IconButton
                      disabled={counterActive}
                      size="large"
                      onClick={switchCamera}
                      aria-label="switch-camera"
                    >
                      <SwitchCameraIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ) : null}

              <Grid item xs={4}>
                <Paper
                  variant="outlined"
                  square
                  color="dark"
                  sx={{
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <IconButton
                    size="large"
                    onClick={capture}
                    disabled={counterActive}
                    aria-label="capture"
                  >
                    {counterActive ? (
                      <Typography variant="button" display="block">
                        {counter}
                      </Typography>
                    ) : (
                      <CameraIcon />
                    )}
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  variant="outlined"
                  square
                  color="dark"
                  sx={{
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <IconButton
                    disabled={counterActive}
                    size="large"
                    onClick={setTorch}
                    aria-label="flash"
                  >
                    <FlashOnIcon />
                  </IconButton>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Modal
            open={imgCaptured}
            onClose={() => {
              setImgCaptured(false);
              setImgSrc(null);
            }}
            aria-labelledby="modal-img"
            aria-describedby="modal-capturedImg"
          >
            <Box>
              <img
                onLoad={async (e) => {
                  const data = await fetch("http://localhost:5000/upload", {
                    method: "post",
                    headers: {
                      "Content-Type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify({ image: imgSrc }),
                  });
                }}
                ref={imgRef}
                id="imgSrc"
                alt="CameraScreenshot"
                src={imgSrc}
              />
            </Box>
          </Modal>
          <img
            hidden
            onLoad={(e) => {
              let src = openCv.imread(e.target);
              // Convert RGB to Gray
              let src2gray = new openCv.Mat();
              openCv.cvtColor(src, src2gray, openCv.COLOR_RGBA2GRAY);
              src.delete();
              // Testing something
              if (src2gray.isContinuous()) {
                const pixels = [];
                for (let row = 0; row < src2gray.cols; row++) {
                  for (let col = 0; col < src2gray.rows; col++) {
                    const pixel =
                      src2gray.data[
                        row * src2gray.cols * src2gray.channels() +
                          col * src2gray.channels()
                      ];
                    if (pixel <= 90) {
                      pixels.push(pixel);
                    }
                  }
                }
                if (
                  pixels.length / (src2gray.cols * src2gray.rows) >= 0.65 &&
                  !flash
                ) {
                  alert("Low Light Detected! Turning Flash On");
                  setTorch();
                }
              }
              src2gray.delete();
            }}
            ref={flashRef}
            src={flashSrc}
            id="flashImg"
          ></img>
        </>
      )}
    </>
  );
};

export default Camera;
