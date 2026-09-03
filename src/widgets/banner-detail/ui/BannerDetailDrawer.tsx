import React, { useEffect, useState } from 'react';
import { Image } from '@arco-design/web-react';

import { BizDetailDrawer } from '@widgets/biz-detail-drawer';
import { postV1AdminBannersDetail } from '@shared/api/admin/platform';
import { CopyValue, RESPONSIVE_DETAIL_COLUMNS, StatusBadge } from '@shared/ui';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

export type BannerDetailDrawerProps = {
  visible: boolean;
  id: string | null;
  onClose: () => void;
};

export default function BannerDetailDrawer({
  visible,
  id,
  onClose
}: BannerDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<AdminAPI.Banner | null>(null);

  useEffect(() => {
    if (!visible || !id) {
      setBanner(null);
      return;
    }
    let active = true;
    setLoading(true);
    postV1AdminBannersDetail({ id })
      .then((res) => {
        if (active) setBanner(res.data?.banner || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, visible]);

  return (
    <BizDetailDrawer
      visible={visible}
      title={t['asset.banner.detailTitle']}
      loading={loading}
      onCancel={onClose}
      sections={
        banner
          ? [
              {
                key: 'content',
                title: t['asset.banner.section.content'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['asset.banner.field.image'],
                    value: <Image src={banner.image_url} width={192} alt="" />,
                    span: 2
                  },
                  { label: t['asset.banner.field.title'], value: banner.title },
                  {
                    label: t['asset.banner.field.bannerId'],
                    value: <CopyValue value={banner.banner_id} />
                  },
                  {
                    label: t['asset.banner.field.actionType'],
                    value: t[`asset.banner.actionType.${banner.action_type}`]
                  },
                  {
                    label: t['asset.banner.field.actionValue'],
                    value: <CopyValue value={banner.action_value} />
                  }
                ]
              },
              {
                key: 'targeting',
                title: t['asset.banner.section.targeting'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['asset.banner.field.type'],
                    value: t[`asset.banner.type.${banner.type}`]
                  },
                  {
                    label: t['asset.banner.field.platforms'],
                    value: banner.platforms
                      .map((value) => t[`asset.banner.platform.${value}`])
                      .join(' / ')
                  },
                  { label: t['asset.banner.field.language'], value: banner.language },
                  { label: t['asset.banner.field.sort'], value: banner.sort }
                ]
              },
              {
                key: 'schedule',
                title: t['asset.banner.section.schedule'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['asset.banner.field.enabled'],
                    value: (
                      <StatusBadge
                        status={banner.is_enable ? 'success' : 'default'}
                        text={banner.is_enable ? t['common.enabled'] : t['common.disabled']}
                      />
                    )
                  },
                  { label: t['asset.banner.field.startsAt'], value: formatDateTime(banner.starts_at) },
                  { label: t['asset.banner.field.endsAt'], value: formatDateTime(banner.ends_at) },
                  { label: t['asset.banner.field.createdAt'], value: formatDateTime(banner.created_at) },
                  { label: t['asset.banner.field.updatedAt'], value: formatDateTime(banner.updated_at) }
                ]
              }
            ]
          : []
      }
    />
  );
}
