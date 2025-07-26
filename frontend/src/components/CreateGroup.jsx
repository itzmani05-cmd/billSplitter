// src/pages/CreateGroup.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const CreateGroup = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        message.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const onFinish = async (values) => {
    const memberSet = new Set(values.members);
    memberSet.add(currentUser._id);

    const groupData = {
      name: values.name,
      members: Array.from(memberSet),
      created_by: currentUser._id,
    };

    try {
      const res = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      if (res.ok) {
        message.success('Group created successfully');
        navigate('/dashboard');
      } else {
        const errData = await res.json();
        message.error(errData.error || 'Error creating group');
      }
    } catch (err) {
      console.error('Group creation error:', err);
      message.error('Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto' }}>
      <Card>
        <Title level={3}>Create Group</Title>

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label="Group Name"
            name="name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item
            label="Select Members"
            name="members"
            rules={[{ required: true, message: 'Please select at least one member' }]}
          >
            <Select
              mode="multiple"
              loading={loading}
              placeholder="Select members"
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Group
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateGroup;
