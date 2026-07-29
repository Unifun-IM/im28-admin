import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, Message, Modal } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getBlacklist, postBlacklistAction } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getBlacklist({ page: p, pageSize: size, ...values });
      setData((res.list || []) as Record<string, unknown>[]);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [form, page, pageSize]);

  useEffect(() => { fetchData(1, pageSize); setPage(1); }, []);

  const remove = (ids: string[]) => {
    Modal.confirm({
      title: '确认将该用户解除黑名单？',
      onOk: async () => {
        await postBlacklistAction({ ids, action: 'remove' });
        Message.success('已解除黑名单');
        fetchData(page, pageSize);
      }
    });
  };

  return (
    <BizListPage
      form={form}
      title="黑名单"
      filter={
        <>
          <FormItem field="keyword" label="关键词">
            <Input placeholder="用户ID / 昵称" />
          </FormItem>
        </>
      }
      onSearch={() => { setPage(1); fetchData(1, pageSize); }}
      onReset={() => { form.resetFields(); setPage(1); fetchData(1, pageSize); }}
      onRefresh={() => fetchData(page, pageSize)}
      toolbar={
        <Button
          disabled={!selectedRowKeys.length}
          onClick={() => remove(selectedRowKeys.map(String))}
        >
          批量解除
        </Button>
      }
      batchActions={{
        onDelete: () => remove(selectedRowKeys.map(String))
      }}
      tableProps={{
        loading,
        data,
        rowSelection: { selectedRowKeys, onChange: setSelectedRowKeys },
        columns: [
          { title: '用户ID', dataIndex: 'userId' },
          { title: '昵称', dataIndex: 'nickname' },
          { title: '原因', dataIndex: 'reason' },
          { title: '操作人', dataIndex: 'operator' },
          { title: '时间', dataIndex: 'time', width: 180 },
          {
            title: '操作',
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Button type="text" status="danger" onClick={() => remove([String(row.id)])}>
                解除黑名单
              </Button>
            )
          }
        ],
        pagination: {
          current: page, pageSize, total,
          onChange: (p, s) => { setPage(p); setPageSize(s); fetchData(p, s); }
        }
      }}
    />
  );
}
