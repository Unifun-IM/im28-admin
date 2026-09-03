import React, { useEffect, useState } from 'react';

import { BizDetailDrawer } from '@widgets/biz-detail-drawer';
import { postV1AdminClientVersionsDetail } from '@shared/api/admin/platform';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';
import { CopyValue, RESPONSIVE_DETAIL_COLUMNS, StatusBadge } from '@shared/ui';

export type ClientVersionDetailDrawerProps = {
  visible: boolean;
  id: string | null;
  onClose: () => void;
};

export default function ClientVersionDetailDrawer({
  visible,
  id,
  onClose
}: ClientVersionDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [clientVersion, setClientVersion] =
    useState<AdminAPI.ClientVersion | null>(null);

  useEffect(() => {
    if (!visible || !id) {
      setClientVersion(null);
      return;
    }
    let active = true;
    setLoading(true);
    postV1AdminClientVersionsDetail({ id })
      .then((res) => {
        if (active) setClientVersion(res.data?.client_version || null);
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
      title={t['platform.clientVersion.detailTitle']}
      loading={loading}
      onCancel={onClose}
      sections={
        clientVersion
          ? [
              {
                key: 'version',
                title: t['common.basicInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.clientVersion.field.id'],
                    value: <CopyValue value={clientVersion.id} />
                  },
                  {
                    label: t['platform.clientVersion.field.platform'],
                    value: clientVersion.platform
                  },
                  {
                    label: t['platform.clientVersion.field.version'],
                    value: clientVersion.version
                  },
                  {
                    label: t['platform.clientVersion.field.buildNumber'],
                    value: clientVersion.build_number
                  },
                  {
                    label: t['platform.clientVersion.field.forceUpdate'],
                    value: (
                      <StatusBadge
                        status={clientVersion.force_update ? 'warning' : 'default'}
                        text={
                          clientVersion.force_update
                            ? t['platform.clientVersion.force.required']
                            : t['platform.clientVersion.force.optional']
                        }
                      />
                    )
                  },
                  {
                    label: t['platform.clientVersion.field.enabled'],
                    value: (
                      <StatusBadge
                        status={clientVersion.is_enable ? 'success' : 'default'}
                        text={
                          clientVersion.is_enable
                            ? t['common.enabled']
                            : t['common.disabled']
                        }
                      />
                    )
                  }
                ]
              },
              {
                key: 'release',
                title: t['platform.clientVersion.field.description'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.clientVersion.field.downloadUrl'],
                    value: clientVersion.download_url ? (
                      <CopyValue value={clientVersion.download_url} />
                    ) : undefined,
                    span: 2
                  },
                  {
                    label: t['platform.clientVersion.field.title'],
                    value: clientVersion.title,
                    span: 2
                  },
                  {
                    label: t['platform.clientVersion.field.description'],
                    value: clientVersion.description,
                    span: 2
                  }
                ]
              },
              {
                key: 'audit',
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.clientVersion.field.createdAt'],
                    value: formatDateTime(clientVersion.created_at)
                  },
                  {
                    label: t['platform.clientVersion.field.updatedAt'],
                    value: formatDateTime(clientVersion.updated_at)
                  }
                ]
              }
            ]
          : []
      }
    />
  );
}
