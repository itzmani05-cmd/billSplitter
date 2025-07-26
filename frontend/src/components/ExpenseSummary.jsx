import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, List, Tag } from 'antd';

const { Title, Paragraph } = Typography;

const ExpenseSummary = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({}); // { groupId: { userId: netAmount } }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, groupsRes] = await Promise.all([
          fetch('http://localhost:5000/api/expenses'),
          fetch('http://localhost:5000/api/groups'),
        ]);

        const [expensesData, groupsData] = await Promise.all([
          expensesRes.json(),
          groupsRes.json(),
        ]);

        // Filter only groups the user is part of
        const myGroups = groupsData.filter(group =>
          group.members.some(m => (typeof m === 'object' ? m._id : m) === userId)
        );

        const myGroupIds = myGroups.map(g => g._id);

        const myExpenses = expensesData.filter(exp =>
          myGroupIds.includes(exp.group_id?._id || exp.group_id)
        );

        setGroups(myGroups);
        setExpenses(myExpenses);

        const groupBalances = {};

        myGroups.forEach(group => {
          const groupUsers = group.members.map(m => (typeof m === 'object' ? m : null)).filter(Boolean);
          const userMap = {};
          groupUsers.forEach(user => {
            userMap[user._id] = { name: user.name, balance: 0 };
          });

          const groupExpenses = myExpenses.filter(exp =>
            (exp.group_id?._id || exp.group_id) === group._id
          );

          groupExpenses.forEach(exp => {
            const splitWith = Array.isArray(exp.splitAmount) ? exp.splitAmount : [];
            const perHead = exp.amount / (splitWith.length || 1);

            splitWith.forEach(uid => {
              if (uid !== exp.paid_by?._id) {
                if (userMap[uid]) userMap[uid].balance -= perHead;
                if (userMap[exp.paid_by?._id]) userMap[exp.paid_by?._id].balance += perHead;
              }
            });
          });

          groupBalances[group._id] = userMap;
        });

        setBalances(groupBalances);
      } catch (err) {
        console.error('Summary load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <Title level={3}>Expense Summary</Title>

      {loading ? (
        <Spin />
      ) : Object.keys(balances).length === 0 ? (
        <Empty description="No expense summary found" />
      ) : (
        groups.map(group => (
          <Card key={group._id} title={group.name} style={{ marginBottom: 24 }}>
            <List
              dataSource={Object.entries(balances[group._id])}
              renderItem={([uid, { name, balance }]) => (
                <List.Item>
                  <Paragraph>
                    {name} —&nbsp;
                    <Tag color={balance > 0 ? 'green' : balance < 0 ? 'red' : 'blue'}>
                      {balance > 0
                        ? `Gets ₹${balance.toFixed(2)}`
                        : balance < 0
                        ? `Owes ₹${(-balance).toFixed(2)}`
                        : 'Settled'}
                    </Tag>
                  </Paragraph>
                </List.Item>
              )}
            />
          </Card>
        ))
      )}
    </div>
  );
};

export default ExpenseSummary;
