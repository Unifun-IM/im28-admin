import React, { useEffect, useState } from 'react';

import { BizDetailDrawer } from '@widgets/biz-detail-drawer';
import { postV1AdminTermsDetail } from '@shared/api/admin/platform';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';
import { CopyValue, RESPONSIVE_DETAIL_COLUMNS, StatusBadge } from '@shared/ui';

export type PlatformTermDetailDrawerProps = {
  visible: boolean;
  id: string | null;
  onClose: () => void;
};

export default function PlatformTermDetailDrawer({
  visible,
  id,
  onClose
}: PlatformTermDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState<AdminAPI.PlatformTerm | null>(null);

  useEffect(() => {
    if (!visible || !id) {
      setTerm(null);
      return;
    }
    let active = true;
    setLoading(true);
    postV1AdminTermsDetail({ id })
      .then((res) => {
        if (active) setTerm(res.data?.term || null);
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
      title={t['platform.term.detailTitle']}
      loading={loading}
      onCancel={onClose}
      sections={
        term
          ? [
              {
                key: 'identity',
                title: t['common.basicInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.term.field.id'],
                    value: <CopyValue value={term.id} />
                  },
                  { label: t['platform.term.field.key'], value: term.key },
                  { label: t['platform.term.field.title'], value: term.title },
                  { label: t['platform.term.field.version'], value: term.version },
                  {
                    label: t['platform.term.field.enabled'],
                    value: (
                      <StatusBadge
                        status={term.is_enable ? 'success' : 'default'}
                        text={
                          term.is_enable
                            ? t['common.enabled']
                            : t['common.disabled']
                        }
                      />
                    )
                  }
                ]
              },
              {
                key: 'content',
                title: t['platform.term.field.content'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.term.field.content'],
                    value: term.content,
                    span: 2
                  }
                ]
              },
              {
                key: 'audit',
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['platform.term.field.createdAt'],
                    value: formatDateTime(term.created_at)
                  },
                  {
                    label: t['platform.term.field.updatedAt'],
                    value: formatDateTime(term.updated_at)
                  }
                ]
              }
            ]
          : []
      }
    />
  );
}
