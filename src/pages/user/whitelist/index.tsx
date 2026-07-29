import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, Message, Modal } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getWhitelist, postWhitelistAction } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getWhitelist({ page: p, pageSize: size, ...values });
      setData((res.list || []) as Record<string, unknown>[]);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [form, page, pageSize]);

  useEffect(() => { fetchData(1, pageSize); setPage(1); }, []);

  const add = () => {
    let keyword = '';
    Modal.confirm({
      title: '添加白名单用户',
      content: (
        <Input placeholder="用户ID / 手机号 / 邮箱 / 账号 / 昵称" onChange={(v) => { keyword = v; }} />
      ),
      onOk: async () => {
        if (!keyword) { Message.warning('请输入用户标识'); throw new Error('empty'); }
        await postWhitelistAction({ ids: [], action: 'add', keyword });
        Message.success('已添加');
        fetchData(page, pageSize);
      }
    });
  };

  const remove = (ids: string[]) => {
    Modal.confirm({
      title: '移除白名单用户',
      onOk: async () => {
        await postWhitelistAction({ ids, action: 'remove' });
        Message.success('已移除');
        fetchData(page, pageSize);
      }
    });
  };

  return (
    <BizListPage
      form={form}
      title="白名单"
      filter={<FormItem field="keyword" label="关键词"><Input placeholder="用户ID / 昵称" /></FormItem>}
      onSearch={() => { setPage(1); fetchData(1, pageSize); }}
      onReset={() => { form.resetFields(); setPage(1); fetchData(1, pageSize); }}
      onRefresh={() => fetchData(page, pageSize)}
      toolbar={
        <>
          <Button type="primary" onClick={add}>添加白名单</Button>
          <Button disabled={!selectedRowKeys.length} onClick={() => remove(selectedRowKeys.map(String))}>批量移除</Button>
        </>
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
          { title: '备注', dataIndex: 'remark' },
          { title: '操作人', dataIndex: 'operator' },
          { title: '时间', dataIndex: 'time', width: 180 },
          {
            title: '操作', width: 100,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Button type="text" status="danger" onClick={() => remove([String(row.id)])}>移除</Button>
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
