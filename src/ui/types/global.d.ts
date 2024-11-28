declare global {
  interface Window {
    API: {
      closeWindow: () => void;
      maximizeWindow: () => void;
      minimizeWindow: () => void;
      createTask: (data: data) => Promise<any>;
      getTask: (key: string) => any;
      getPreloadPath: () => string | null;
      getWebContents(): Electron.WebContents;
    };
  }

  type WindowControlEventHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;

  interface Task {
    key: string;
    data: {
      title: string;
      url: string;
    };
  }
  
  interface TabItemProps {
    task: Task;
    isActive: boolean;
  }
}

export {};