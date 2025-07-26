// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import GroupList from '../components/GroupList';
import ExpenseSummary from '../components/ExpenseSummary';
import ExpenseForm from '../components/ExpenseForm';
import SettlementList from '../components/SettlementList';

import { Layout, Tabs, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

const Home = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?._id) {
      setUserId(storedUser._id);
    }
  }, []);

  const tabItems = [
    { key: '1', label: 'Groups', children: <GroupList userId={userId} /> },
    { key: '2', label: 'Add Expense', children: <ExpenseForm userId={userId} /> },
    { key: '3', label: 'Summary', children: <ExpenseSummary userId={userId} /> },
    { key: '4', label: 'Settlement', children: <SettlementList userId={userId} /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Bill Splitter Dashboard
        </Title>
      </Header>
      <Content style={{ padding: '2rem' }}>
        <Tabs defaultActiveKey="1" type="card" items={tabItems} />
      </Content>
    </Layout>
  );
};

export default Home;
