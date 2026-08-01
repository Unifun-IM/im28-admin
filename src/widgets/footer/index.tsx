import React from 'react';
import { Layout } from '@arco-design/web-react';
import { FooterProps } from '@arco-design/web-react/es/Layout/interface';
import cs from 'classnames';

function Footer(props: FooterProps = {}) {
  const { className, ...restProps } = props;
  return (
    <Layout.Footer
      className={cs(
        'flex h-10 items-center justify-center text-center text-arco-text-2',
        className
      )}
      {...restProps}
    >
      Arco Design Pro
    </Layout.Footer>
  );
}

export default Footer;
