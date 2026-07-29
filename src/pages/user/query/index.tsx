import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Button, Tag } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { BizListPage } from '@widgets/biz-list';
import { getUserList } from '@shared/api/biz';

const FormItem = Form.Item;

export default function UserQueryPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [summary, setSummary] = useState<{ label: string; value: string | number }[]>(
    []
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getUserList({ page: p, pageSize: size, ...values });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
        if (res.summary) {
          const labelMap: Record<string, string> = {
            total: '用户总数',
            online: '在线',
            blacklist: '黑名单',
            cancelled: '注销'
          };
          setSummary(
            Object.entries(res.summary).map(([key, value]) => ({
              label: labelMap[key] || key,
              value: value as string | number
            }))
          );
        }
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
          <FormItem field="keyword" label="关键词">
            <Input
              addBefore={
                <FormItem field="keywordType" noStyle initialValue="userId">
                  <Select
                    options={[
                      { label: '用户ID', value: 'userId' },
                      { label: '昵称', value: 'nickname' },
                      { label: '手机号', value: 'phone' },
                      { label: '邮箱', value: 'email' },
                      { label: '账号', value: 'account' }
                    ]}
                    style={{ width: 100 }}
                  />
                </FormItem>
              }
              placeholder="请输入关键词"
            />
          </FormItem>
          <FormItem field="status" label="账号状态">
            <Select
              allowClear
              placeholder="全部"
              options={[
                { label: '正常', value: '正常' },
                { label: '黑名单', value: '黑名单' },
                { label: '注销', value: '注销' }
              ]}
            />
          </FormItem>
          <FormItem field="online" label="在线状态">
            <Select
              allowClear
              placeholder="全部"
              options={[
                { label: '在线', value: '在线' },
                { label: '离线', value: '离线' }
              ]}
            />
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
      summary={summary.length ? summary : undefined}
      tableProps={{
        loading,
        data,
        columns: [
          { title: '用户ID', dataIndex: 'userId' },
          { title: '昵称', dataIndex: 'nickname' },
          { title: '账号', dataIndex: 'account' },
          { title: '手机号', dataIndex: 'phone' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => (
              <Tag color={v === '正常' ? 'green' : v === '黑名单' ? 'red' : 'gray'}>
                {v}
              </Tag>
            )
          },
          { title: '在线', dataIndex: 'online' },
          { title: '注册时间', dataIndex: 'registerTime', width: 180 },
          {
            title: '操作',
            dataIndex: 'op',
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Button type="text" onClick={() => navigate(`/user/detail/${row.id}`)}>
                详情
              </Button>
            )
          }
        ],
        rowSelection: {
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        },
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
