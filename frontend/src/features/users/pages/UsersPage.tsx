import { useState } from 'react';
import { App, Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsersList } from '../hooks/useUsers';
import { UserFormModal } from '../components/UserFormModal';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types';
import { handleApiError } from '@/utils/handle-api-error';

export default function UsersPage(): JSX.Element {
  const { modal, message } = App.useApp();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  const listQuery = useUsersList({ limit: 20, ...(cursor ? { cursor } : {}) });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const openCreate = (): void => {
    setEditing(undefined);
    setModalOpen(true);
  };
  const openEdit = (user: User): void => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSubmit = (values: CreateUserPayload | UpdateUserPayload): void => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            void message.success('User updated');
            setModalOpen(false);
          },
          onError: (err) => handleApiError(err),
        },
      );
    } else {
      createMutation.mutate(values as CreateUserPayload, {
        onSuccess: () => {
          void message.success('User created');
          setModalOpen(false);
        },
        onError: (err) => handleApiError(err),
      });
    }
  };

  const handleDelete = (user: User): void => {
    modal.confirm({
      title: `Delete ${user.name}?`,
      content: 'This action cannot be undone.',
      okType: 'danger',
      okText: 'Delete',
      onOk: () =>
        new Promise<void>((resolve) => {
          deleteMutation.mutate(user.id, {
            onSuccess: () => {
              void message.success('User deleted');
              resolve();
            },
            onError: (err) => {
              handleApiError(err);
              resolve();
            },
          });
        }),
    });
  };

  const columns: ColumnsType<User> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: User['role']) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Users
        </Typography.Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => listQuery.refetch()}
            loading={listQuery.isFetching}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New user
          </Button>
        </Space>
      </Space>

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={listQuery.data?.items ?? []}
        loading={listQuery.isLoading}
        pagination={false}
      />

      <Space style={{ marginTop: 16 }}>
        <Button disabled={!cursor} onClick={() => setCursor(undefined)}>
          First page
        </Button>
        <Button
          disabled={!listQuery.data?.nextCursor}
          onClick={() => setCursor(listQuery.data?.nextCursor ?? undefined)}
        >
          Next page
        </Button>
      </Space>

      <UserFormModal
        open={modalOpen}
        {...(editing ? { initial: editing } : {})}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
