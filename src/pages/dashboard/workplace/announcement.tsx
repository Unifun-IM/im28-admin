import React, { useState, useEffect } from 'react';
import { Link, Card, Skeleton, Tag, Typography } from '@arco-design/web-react';
import { getApiWorkplaceAnnouncement } from '@shared/api/workplace';
import useLocale from '@shared/lib/useLocale';
import locale from './locale';

function Announcement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = useLocale(locale);

  const fetchData = () => {
    setLoading(true);
    getApiWorkplaceAnnouncement()
      .then((list) => {
        setData(list || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  function getTagColor(type) {
    switch (type) {
      case 'activity':
        return 'orangered';
      case 'info':
        return 'cyan';
      case 'notice':
        return 'arcoblue';
      default:
        return 'arcoblue';
    }
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title heading={6}>
          {t['workplace.announcement']}
        </Typography.Title>
        <Link>{t['workplace.seeMore']}</Link>
      </div>
      <Skeleton loading={loading} text={{ rows: 5, width: '100%' }} animation>
        <div>
          {data.map((d) => (
            <div key={d.key} className="mb-1 flex h-6 w-full items-center">
              <Tag color={getTagColor(d.type)} size="small">
                {t[`workplace.${d.type}`]}
              </Tag>
              <span className="ml-1 flex-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-arco-text-2 no-underline">
                {d.content}
              </span>
            </div>
          ))}
        </div>
      </Skeleton>
    </Card>
  );
}

export default Announcement;
