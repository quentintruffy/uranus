const shutdownLoadingScreen = () => {
  DoScreenFadeOut(0);
  ShutdownLoadingScreen();
  ShutdownLoadingScreenNui();
};

export { shutdownLoadingScreen };
