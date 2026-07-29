import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@arco-design/web-react';
import styles from './style/icon-button.module.less';
import cs from 'classnames';

type IconButtonProps = ButtonProps & {
  tip?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { icon, className, tip: _tip, ...rest } = props;

  return (
    <Button
      ref={ref}
      icon={icon}
      type="text"
      className={cs(styles['icon-button'], className)}
      {...rest}
    />
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
