declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.less' {
  const classes: { [className: string]: string };
  export default classes;
}

declare module '*/settings.json' {
  const value: {
    colorWeek: boolean;
    navbar: boolean;
    menu: boolean;
    footer: boolean;
    themeColor: string;
    menuWidth: number;
  };

  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '@arco-design/color';
