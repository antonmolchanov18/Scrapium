declare global {
  interface Window {
    API: {
      closeWindow: () => void;
      maximizeWindow: () => void;
      minimizeWindow: () => void;
    };
  }

  type WindowControlEventHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

export {};