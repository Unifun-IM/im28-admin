import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Tag } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getInviteCodes } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getInviteCodes({ page: p, pageSize: size, ...values });
      setData((res.list || []) as Record<string, unknown>[]);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [form, page, pageSize]);

  useEffect(() => { fetchData(1, pageSize); setPage(1); }, []);

  return (
    <BizListPage
      form={form}
      filter={
        <>
          <FormItem field="keyword" label="邀请码/昵称"><Input placeholder="请输入" /></FormItem>
          <FormItem field="status" label="状态">
            <Select allowClear placeholder="全部" options={[{label:'有效',value:'有效'},{label:'过期',value:'过期'},{label:'已用尽',value:'已用尽'}]} />
          </FormItem>
        </>
      }
      onSearch={() => { setPage(1); fetchData(1, pageSize); }}
      onReset={() => { form.resetFields(); setPage(1); fetchData(1, pageSize); }}
      tableProps={{
        loading, data,
        columns: [
          { title: '邀请码', dataIndex: 'inviteCode' },
          { title: '所属用户ID', dataIndex: 'ownerId' },
          { title: '所属昵称', dataIndex: 'ownerName' },
          { title: '已用/上限', render: (_: unknown, r: Record<string, unknown>) => `${r.usedCount}/${r.maxCount}` },
          { title: '过期时间', dataIndex: 'expireAt', width: 180 },
          { title: '状态', dataIndex: 'status', render: (v: string) => <Tag>{v}</Tag> }
        ],
        pagination: { current: page, pageSize, total, onChange: (p, s) => { setPage(p); setPageSize(s); fetchData(p, s); } }
      }}
    />
  );
}
