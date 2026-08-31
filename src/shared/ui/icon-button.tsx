import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@arco-design/web-react';
import cs from 'classnames';

export type IconButtonProps = ButtonProps & {
  tip?: string;
  active?: boolean;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { icon, className, tip, active, ...rest } = props;
  void tip;

  return (
    <Button
      ref={ref}
      icon={icon}
      type="text"
      className={cs(
        'use-navbar-icon-btn',
        active && 'is-active',
        className
      )}
      {...rest}
    />
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
