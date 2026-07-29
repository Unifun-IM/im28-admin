import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Drawer,
  Message,
  Checkbox,
  Space
} from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getRoles } from '@shared/api/biz';

const FormItem = Form.Item;

const PERMS = [
  '用户查询',
  '用户拉黑',
  '白名单管理',
  '后台账号管理',
  '角色管理',
  '系统参数设置',
  '操作日志查看',
  '群聊查询',
  '聊天记录查看',
  '充值管理',
  '提现管理',
  '红包管理'
];

export default function RolesPage() {
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
        const res = await getRoles({ page: p, pageSize: size, ...values });
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
          <FormItem field="keyword" label="角色名称">
            <Input placeholder="请输入" />
          </FormItem>
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
            新增角色
          </Button>
        }
        tableProps={{
          loading,
          data,
          columns: [
            { title: '角色名称', dataIndex: 'name' },
            { title: '角色描述', dataIndex: 'desc' },
            { title: '成员数', dataIndex: 'memberCount' },
            { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
            {
              title: '操作',
              width: 100,
              render: () => (
                <Button type="text" onClick={() => setVisible(true)}>
                  编辑
                </Button>
              )
            }
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
        width={480}
        title="新建角色"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                await createForm.validate();
                Message.success('已保存（mock）');
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
            field="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </FormItem>
          <FormItem field="desc" label="角色描述">
            <Input.TextArea />
          </FormItem>
          <FormItem
            field="perms"
            label="管理权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Checkbox.Group options={PERMS} direction="vertical" />
          </FormItem>
        </Form>
      </Drawer>
    </>
  );
}
