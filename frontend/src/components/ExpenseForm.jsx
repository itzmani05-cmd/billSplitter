import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  message,
  List,
  Card,
  Empty,
  Typography,
  Row,
  Col,
  Divider,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const ExpenseForm = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadData = async () => {
      message.loading({ content: 'Loading data...', key: 'loadData', duration: 0 });

      try {
        const [expensesRes, usersRes, groupsRes] = await Promise.all([
          fetch('http://localhost:5000/api/expenses'),
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/groups'),
        ]);

        const [expensesData, usersData, groupsData] = await Promise.all([
          expensesRes.json(),
          usersRes.json(),
          groupsRes.json(),
        ]);

        const myGroups = groupsData.filter(group =>
          group.members.some(m => (typeof m === 'object' ? m._id : m) === userId)
        );

        const myExpenses = expensesData.filter(exp =>
          myGroups.some(g => (exp.group_id?._id || exp.group_id) === g._id)
        );

        setGroups(myGroups);
        setUsers(usersData);
        setExpenses(myExpenses);

        message.success({ content: 'Data loaded', key: 'loadData', duration: 2 });
      } catch (err) {
        console.error('Load error:', err);
        message.error({ content: 'Failed to load data', key: 'loadData' });
      }
    };

    loadData();
  }, [userId]);

  const onGroupChange = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    if (!group) return;

    const members = group.members
      .map(m => (typeof m === 'object' ? m : users.find(u => u._id === m)))
      .filter(Boolean); // ensures no undefined users

    form.setFieldsValue({ splitBetween: members.map(m => m._id) });
    setSelectedGroupUsers(members);
  };

  const onFinish = async (values) => {
    const expense = {
      title: values.description,
      amount: values.amount,
      paid_by: userId,
      group_id: values.groupId,
      splitType: 'equal',
      splitAmount: values.splitBetween,
    };

    const hide = message.loading({ content: 'Adding expense...', key: 'addExpense', duration: 0 });

    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add expense');
      }

      message.success({ content: 'Expense added successfully!', key: 'addExpense', duration: 2 });

      form.resetFields();
      setSelectedGroupUsers([]);

      // Refresh expenses
      const updated = await (await fetch('http://localhost:5000/api/expenses')).json();
      const groupIds = groups.map(g => g._id);
      const filtered = updated.filter(exp => groupIds.includes(exp.group_id?._id || exp.group_id));
      setExpenses(filtered);
    } catch (err) {
      console.error(err);
      message.error({ content: err.message || 'Something went wrong', key: 'addExpense' });
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '20px' }}>
      <Card
        title={<Title level={4}><PlusOutlined /> Add New Expense</Title>}
        bordered={false}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Group"
                name="groupId"
                rules={[{ required: true, message: 'Please select a group' }]}
              >
                <Select placeholder="Select group" onChange={onGroupChange}>
                  {groups.map(({ _id, name }) => (
                    <Option key={_id} value={_id}>{name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Amount (₹)"
                name="amount"
                rules={[{ required: true, message: 'Enter an amount' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Eg. 500" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Add a description' }]}
              >
                <Input placeholder="Eg. Lunch at XYZ" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Split Between"
                name="splitBetween"
                rules={[{ required: true, message: 'Select users' }]}
              >
                <Select mode="multiple" placeholder="Select members">
                  {selectedGroupUsers.map(({ _id, name, email }) => (
                    <Option key={_id} value={_id}>{name} ({email})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: '8px' }}>
              Add Expense
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <div style={{ marginTop: 32 }}>
        <Title level={4}>Your Group Expenses</Title>
        {expenses.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={expenses}
            renderItem={({ _id, title, amount, paid_by, group_id }) => (
              <List.Item key={_id}>
                <Card
                  title={<Text strong>{title}</Text>}
                  style={{ borderRadius: 10 }}
                  extra={<Text type="success">₹{amount}</Text>}
                >
                  <Space direction="vertical">
                    <Text><strong>Paid by:</strong> {paid_by?.name || 'Unknown'}</Text>
                    <Text><strong>Group:</strong> {group_id?.name || 'Unknown'}</Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No expenses found for your groups" style={{ marginTop: 40 }} />
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
