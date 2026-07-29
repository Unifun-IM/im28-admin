import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Drawer,
  Message,
  Tag,
  Space
} from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getAccounts } from '@shared/api/biz';

const FormItem = Form.Item;

export default function AccountsPage() {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visible, setVisible] = useState(false);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getAccounts({ page: p, pageSize: size, ...values });
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
    <>
      <BizListPage
        form={form}
        filter={
          <>
            <FormItem field="keyword" label="关键词">
              <Input placeholder="账号 / 姓名" />
            </FormItem>
            <FormItem field="status" label="状态">
              <Select
                allowClear
                placeholder="全部"
                options={[
                  { label: '启用', value: '启用' },
                  { label: '停用', value: '停用' }
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
        toolbar={
          <Button type="primary" onClick={() => setVisible(true)}>
            新建账号
          </Button>
        }
        tableProps={{
          loading,
          data,
          columns: [
            { title: '账号', dataIndex: 'account' },
            { title: '姓名', dataIndex: 'name' },
            { title: '角色', dataIndex: 'role' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (v: string) => (
                <Tag color={v === '启用' ? 'green' : 'gray'}>{v}</Tag>
              )
            },
            { title: '最近登录', dataIndex: 'lastLogin', width: 180 },
            { title: '创建时间', dataIndex: 'createdAt', width: 180 }
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
      <Drawer
        width={420}
        title="新建账号"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                await createForm.validate();
                Message.success('已创建（mock）');
                setVisible(false);
                createForm.resetFields();
                fetchData(page, pageSize);
              }}
            >
              确定
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <FormItem
            field="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input />
          </FormItem>
          <FormItem
            field="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </FormItem>
          <FormItem
            field="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              options={['超级管理员', '运营', '客服', '财务'].map((v) => ({
                label: v,
                value: v
              }))}
            />
          </FormItem>
        </Form>
      </Drawer>
    </>
  );
}
