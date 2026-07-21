import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types';

interface UserFormValues {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface UserFormModalProps {
  readonly open: boolean;
  readonly initial?: User;
  readonly submitting: boolean;
  readonly onSubmit: (values: CreateUserPayload | UpdateUserPayload) => void;
  readonly onCancel: () => void;
}

export function UserFormModal({
  open,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: UserFormModalProps): JSX.Element {
  const [form] = Form.useForm<UserFormValues>();
  const isEdit = Boolean(initial);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initial
          ? { email: initial.email, name: initial.name, role: initial.role }
          : { email: '', name: '', role: 'user' },
      );
    }
  }, [open, initial, form]);

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit user' : 'Create user'}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={submitting}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Must be a valid email' },
          ]}
        >
          <Input placeholder="user@example.com" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Name is required' },
            { max: 100, message: 'Max 100 characters' },
          ]}
        >
          <Input placeholder="Full name" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
