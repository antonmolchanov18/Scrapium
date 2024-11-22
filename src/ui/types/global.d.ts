declare global {
  interface Window {
    API: {
      closeWindow: () => void;
      maximizeWindow: () => void;
      minimizeWindow: () => void;
      createTask: (data: data) => Promise<any>;
    };
  }

  type WindowControlEventHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

export {};