import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getOpLogs } from '@shared/api/biz';

const FormItem = Form.Item;

export default function OpLogsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getOpLogs({ page: p, pageSize: size, ...values });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BizListPage
      form={form}
      filter={
        <>
          <FormItem field="keyword" label="操作账号">
            <Input placeholder="请输入" />
          </FormItem>
          <FormItem field="action" label="操作类型">
            <Select
              allowClear
              placeholder="全部"
              options={[
                '用户查询',
                '用户拉黑',
                '角色管理',
                '系统参数设置',
                '操作日志查看'
              ].map((v) => ({ label: v, value: v }))}
            />
          </FormItem>
          <FormItem field="timeRange" label="操作时间">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </FormItem>
        </>
      }
      onSearch={() => {
        setPage(1);
        fetchData(1, pageSize);
      }}
      onReset={() => {
        form.resetFields();
        setPage(1);
        fetchData(1, pageSize);
      }}
      tableProps={{
        loading,
        data,
        columns: [
          { title: '操作账号', dataIndex: 'account' },
          { title: '操作类型', dataIndex: 'action' },
          { title: '操作路径', dataIndex: 'path' },
          { title: '操作 IP', dataIndex: 'ip' },
          { title: '操作内容', dataIndex: 'content', ellipsis: true },
          { title: '时间', dataIndex: 'time', width: 180 }
        ],
        pagination: {
          current: page,
          pageSize,
          total,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
            fetchData(p, s);
          }
        }
      }}
    />
  );
}
