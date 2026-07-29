import React from 'react';
import { Grid, Space } from '@arco-design/web-react';
import Overview from './overview';
import PopularContents from './popular-contents';
import ContentPercentage from './content-percentage';
import Shortcuts from './shortcuts';
import Announcement from './announcement';
import Carousel from './carousel';
import Docs from './docs';
import './mock';

const { Row, Col } = Grid;

const gutter = 16;

function Workplace() {
  return (
    <div className="flex w-full">
      <Space size={16} direction="vertical" className="mr-4 w-[calc(100%-296px)]">
        <Overview />
        <Row gutter={gutter}>
          <Col span={12}>
            <PopularContents />
          </Col>
          <Col span={12}>
            <ContentPercentage />
          </Col>
        </Row>
      </Space>
      <Space className="w-[280px]" size={16} direction="vertical">
        <Shortcuts />
        <Carousel />
        <Announcement />
        <Docs />
      </Space>
    </div>
  );
}

export default Workplace;
