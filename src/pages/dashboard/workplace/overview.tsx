import React, { useState, useEffect, ReactNode } from 'react';
import {
  Grid,
  Card,
  Typography,
  Divider,
  Skeleton,
  Link,
} from '@arco-design/web-react';
import { useGlobalSelector } from '@entities/global-state';
import { IconCaretUp } from '@arco-design/web-react/icon';
import { OverviewAreaLine } from '@widgets/chart';
import { getApiWorkplaceOverviewContent } from '@shared/api/workplace';
import locale from './locale';
import useLocale from '@shared/lib/useLocale';
import IconCalendar from './assets/calendar.svg?react';
import IconComments from './assets/comments.svg?react';
import IconContent from './assets/content.svg?react';
import IconIncrease from './assets/increase.svg?react';

const { Row, Col } = Grid;

type StatisticItemType = {
  icon?: ReactNode;
  title?: ReactNode;
  count?: ReactNode;
  loading?: boolean;
  unit?: ReactNode;
};

function StatisticItem(props: StatisticItemType) {
  const { icon, title, count, loading, unit } = props;
  return (
    <div className="flex items-center pl-5 text-arco-text-1">
      <div className="mr-3 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-arco-fill-2">
        {icon}
      </div>
      <div>
        <Skeleton loading={loading} text={{ rows: 2, width: 60 }} animation>
          <div className="text-xs text-arco-text-1">{title}</div>
          <div className="text-[22px] font-semibold text-arco-text-1">
            {count}
            <span className="ml-2 text-xs font-normal text-arco-text-2">
              {unit}
            </span>
          </div>
        </Skeleton>
      </div>
    </div>
  );
}

type DataType = {
  allContents?: string;
  liveContents?: string;
  increaseComments?: string;
  growthRate?: string;
  chartData?: { count?: number; date?: string }[];
  down?: boolean;
};

function Overview() {
  const [data, setData] = useState<DataType>({});
  const [loading, setLoading] = useState(true);
  const t = useLocale(locale);

  const userInfo = useGlobalSelector((state: any) => state.userInfo || {});

  const fetchData = () => {
    setLoading(true);
    getApiWorkplaceOverviewContent()
      .then((data) => {
        setData(data || {});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <Typography.Title heading={5}>
        {t['workplace.welcomeBack']}
        {userInfo.name}
      </Typography.Title>
      <Divider />
      <Row>
        <Col flex={1}>
          <StatisticItem
            icon={<IconCalendar />}
            title={t['workplace.totalOnlyData']}
            count={data.allContents}
            loading={loading}
            unit={t['workplace.pecs']}
          />
        </Col>
        <Divider type="vertical" className="h-[60px]" />
        <Col flex={1}>
          <StatisticItem
            icon={<IconContent />}
            title={t['workplace.contentInMarket']}
            count={data.liveContents}
            loading={loading}
            unit={t['workplace.pecs']}
          />
        </Col>
        <Divider type="vertical" className="h-[60px]" />
        <Col flex={1}>
          <StatisticItem
            icon={<IconComments />}
            title={t['workplace.comments']}
            count={data.increaseComments}
            loading={loading}
            unit={t['workplace.pecs']}
          />
        </Col>
        <Divider type="vertical" className="h-[60px]" />
        <Col flex={1}>
          <StatisticItem
            icon={<IconIncrease />}
            title={t['workplace.growth']}
            count={
              <span>
                {data.growthRate}{' '}
                <IconCaretUp
                  style={{ fontSize: 18, color: 'rgb(var(--green-6))' }}
                />
              </span>
            }
            loading={loading}
          />
        </Col>
      </Row>
      <Divider />
      <div>
        <div className="mb-4 flex justify-between">
          <Typography.Paragraph
            className="text-base font-medium"
            style={{ marginBottom: 0 }}
          >
            {t['workplace.contentData']}
            <span className="ml-1 text-xs font-normal text-arco-text-3">
              ({t['workplace.1year']})
            </span>
          </Typography.Paragraph>
          <Link>{t['workplace.seeMore']}</Link>
        </div>
        <OverviewAreaLine data={data.chartData} loading={loading} />
      </div>
    </Card>
  );
}

export default Overview;
