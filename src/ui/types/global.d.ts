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
      startParser: (key: string) => Promise<any>;
      setCurrentTaskKey: (key: string) => Promise<any>;
    };
  }

  type WindowControlEventHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  export interface RootState {
    user: {
      nickName: string;
      token: string;
      id: number;
    };
  }

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