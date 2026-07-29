import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, DatePicker, Button, Message, Modal } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterField,
  FilterSelect,
  StatusBadge,
  type SummaryItem
} from '@widgets/biz-list';
import { getUserList } from '@shared/api/biz';

const FormItem = Form.Item;

function statusToBadge(v: string): 'success' | 'error' | 'warning' | 'default' {
  if (v === '正常') return 'success';
  if (v === '黑名单') return 'error';
  if (v === '注销') return 'warning';
  return 'default';
}

export default function UserQueryPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
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
          const meta: Record<string, { label: string; tip: string }> = {
            total: { label: '用户总数', tip: '当前系统注册用户总量' },
            online: { label: '在线', tip: '当前在线用户数' },
            blacklist: { label: '黑名单', tip: '处于黑名单中的用户数' },
            cancelled: { label: '注销', tip: '已注销账号数' }
          };
          setSummary(
            Object.entries(res.summary).map(([key, value]) => ({
              label: meta[key]?.label || key,
              tip: meta[key]?.tip,
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
      title="用户列表"
      filter={
        <>
          <FormItem field="keyword" label="搜索">
            <Input.Search placeholder="请输入搜索内容" allowClear />
          </FormItem>
          <FormItem field="online" label="在线状态">
            <FilterSelect
              allowClear
              placeholder="单选内容"
              options={[
                { label: '在线', value: '在线' },
                { label: '离线', value: '离线' }
              ]}
            />
          </FormItem>
          <FormItem field="status" label="账号状态">
            <FilterSelect
              mode="multiple"
              allowClear
              placeholder="多选内容"
              maxTagCount={2}
              options={[
                { label: '正常', value: '正常' },
                { label: '黑名单', value: '黑名单' },
                { label: '注销', value: '注销' }
              ]}
            />
          </FormItem>
          <FilterField span={2}>
            <FormItem field="registerTime" label="时间区间">
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                placeholder={['开始时间', '结束时间']}
              />
            </FormItem>
          </FilterField>
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
      onRefresh={() => fetchData(page, pageSize)}
      summary={summary.length ? summary : undefined}
      toolbar={
        <Button type="primary" disabled={!selectedRowKeys.length}>
          批量操作
        </Button>
      }
      batchActions={{
        onArchive: () => Message.info(`归档 ${selectedRowKeys.length} 项（mock）`),
        onEdit: () => Message.info(`编辑 ${selectedRowKeys.length} 项（mock）`),
        onDelete: () => {
          Modal.confirm({
            title: '确认删除',
            content: `将删除已选 ${selectedRowKeys.length} 项，是否继续？`,
            onOk: () => {
              Message.success('已删除（mock）');
              setSelectedRowKeys([]);
            }
          });
        }
      }}
      tableProps={{
        loading,
        data,
        columns: [
          {
            title: '用户',
            dataIndex: 'nickname',
            width: 200,
            ellipsis: false,
            render: (_: unknown, row: Record<string, unknown>) => (
              <AvatarNameCell
                name={row.nickname as string}
                sub={row.userId as string}
                avatar={row.avatar as string | undefined}
              />
            )
          },
          { title: '账号', dataIndex: 'account' },
          { title: '手机号', dataIndex: 'phone' },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (v: string) => (
              <StatusBadge status={statusToBadge(v)} text={v} />
            )
          },
          {
            title: '在线',
            dataIndex: 'online',
            width: 90,
            render: (v: string) => (
              <StatusBadge
                status={v === '在线' ? 'success' : 'default'}
                text={v}
              />
            )
          },
          { title: '注册时间', dataIndex: 'registerTime', width: 180 },
          {
            title: '操作',
            dataIndex: 'op',
            width: 108,
            render: (_: unknown, row: Record<string, unknown>) => (
              <ActionLinks
                items={[
                  {
                    key: 'detail',
                    label: '详情',
                    onClick: () => navigate(`/user/detail/${row.id}`)
                  },
                  {
                    key: 'edit',
                    label: '编辑',
                    onClick: () => Message.info('编辑用户（mock）')
                  },
                  {
                    key: 'blacklist',
                    label: '拉黑',
                    danger: true,
                    onClick: () => Message.info('拉黑（mock）')
                  },
                  {
                    key: 'reset',
                    label: '重置密码',
                    onClick: () => Message.info('重置密码（mock）')
                  }
                ]}
              />
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
