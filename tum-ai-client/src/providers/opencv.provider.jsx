import React from "react";
// import cv from "../assests/opencv";

function new_script(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = src;
    script.setAttribute("async", "");
    script.addEventListener("load", function () {
      resolve();
    });
    script.addEventListener("error", function (e) {
      reject(e);
    });
    document.body.appendChild(script);
  });
}
// Promise Interface can ensure load the script only once.
var opencv_script = new_script("./assests/opencv.js");

export const OpenCVContext = React.createContext({
  openCv: [],
  isLoading: true,
  setLoading: () => {},
});

const OpenCVProvider = ({ children }) => {
  const [isLoading, setLoading] = React.useState(true);
  const [openCv, setOpenCv] = React.useState(null);
  React.useEffect(() => {
    opencv_script
      .then(function () {
        setOpenCv(window.cv);
        setLoading(false);
      })
      .catch(function (err) {
        alert("Failed to load Opencv script! Try Reloading");
      });
  }, []);
  // React.useEffect(() => {
  //   setOpenCv(cv);
  // }, []);
  return (
    <OpenCVContext.Provider
      value={{
        isLoading,
        setLoading,
        openCv,
      }}
    >
      {children}
    </OpenCVContext.Provider>
  );
};

export default OpenCVProvider;
