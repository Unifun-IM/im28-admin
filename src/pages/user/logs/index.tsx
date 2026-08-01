import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Message } from '@arco-design/web-react';
import {
  BizListPage,
  FilterField,
  FilterInput
} from '@widgets/biz-list';
import { postV1AdminUsersOperationLogsList } from '@shared/api/admin/users';
import { UserDetailDrawer } from '@features/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';


const FormItem = Form.Item;

/** 用户操作日志 — AdminAPI.AdminListUserOperationLogRequest（user_id 必填） */
export default function Page() {
  const t = useLocale();
  const common = t;

  const [form] = Form.useForm<AdminAPI.AdminListUserOperationLogRequest>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserOperationLog[]>([]);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const values = form.getFieldsValue();
    if (!values.user_id) {
      Message.warning(t['userLogs.warning.userIdRequired']);
      return;
    }
    setLoading(true);
    try {
      const res = await postV1AdminUsersOperationLogsList({
        user_id: values.user_id
      });
      setData(res.data?.list || []);
    } finally {
      setLoading(false);
    }
  }, [form, t]);

  useEffect(() => {
    // 需先填 user_id
  }, []);

  return (
    <>
      <BizListPage
        form={form}
        title={t['userLogs.title']}
        filter={
          <FilterField>
            <FormItem
              field="user_id"
              label={common['common.userId']}
              rules={[{ required: true }]}
            >
              <FilterInput placeholder={common['common.placeholder']} />
            </FormItem>
          </FilterField>
        }
        onSearch={fetchData}
        onReset={() => {
          form.resetFields();
          setData([]);
        }}
        onRefresh={fetchData}
        toolbar={
          <Button
            type="outline"
            onClick={() => {
              const uid = form.getFieldValue('user_id');
              if (uid) setDetailUserId(String(uid));
            }}
          >
            {t['userLogs.action.openUserDetail']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (_: AdminAPI.AdminUserOperationLog, index?: number) =>
            String(index),
          columns: [
            {
              title: t['userLogs.col.operatedAt'],
              dataIndex: 'operated_at',
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['userLogs.col.operationType'],
              dataIndex: 'operation_type'
            },
            {
              title: t['userLogs.col.description'],
              dataIndex: 'description'
            }
          ],
          pagination: false
        }}
      />
      <UserDetailDrawer
        visible={!!detailUserId}
        userId={detailUserId}
        defaultTab="logs"
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}
