import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getUserLogs } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getUserLogs({ page: p, pageSize: size, ...values });
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
          <FormItem field="keyword" label="关键词"><Input placeholder="用户ID / 昵称" /></FormItem>
          <FormItem field="action" label="行为类型">
            <Select allowClear placeholder="全部" options={['登录','注册','修改资料','好友关系','群聊','钱包操作','消息操作'].map(v=>({label:v,value:v}))} />
          </FormItem>
          <FormItem field="client" label="客户端">
            <Select allowClear placeholder="全部" options={['iOS','Android','Web','PC'].map(v=>({label:v,value:v}))} />
          </FormItem>
          <FormItem field="timeRange" label="操作时间"><DatePicker.RangePicker style={{width:'100%'}} /></FormItem>
        </>
      }
      onSearch={() => { setPage(1); fetchData(1, pageSize); }}
      onReset={() => { form.resetFields(); setPage(1); fetchData(1, pageSize); }}
      tableProps={{
        loading, data,
        columns: [
          { title: '日志ID', dataIndex: 'id' },
          { title: '用户ID', dataIndex: 'userId' },
          { title: '昵称', dataIndex: 'nickname' },
          { title: '行为', dataIndex: 'action' },
          { title: '客户端', dataIndex: 'client' },
          { title: 'IP', dataIndex: 'ip' },
          { title: '详情', dataIndex: 'detail', ellipsis: true },
          { title: '时间', dataIndex: 'time', width: 180 }
        ],
        pagination: { current: page, pageSize, total, onChange: (p, s) => { setPage(p); setPageSize(s); fetchData(p, s); } }
      }}
    />
  );
}
