import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Typography, Empty, Spin } from 'antd';

const { Paragraph, Title } = Typography;

const SettlementList = ({ userId }) => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settlements');
        const data = await res.json();

        const userSettlements = data.filter(
          item =>
            item.from_user?._id === userId || item.to_user?._id === userId
        );

        setSettlements(userSettlements);
      } catch (err) {
        console.error('Failed to load settlements:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettlements();
  }, [userId]);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <Title level={3}>Your Settlements</Title>

      {loading ? (
        <Spin />
      ) : settlements.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={settlements}
          renderItem={item => (
            <List.Item key={item._id}>
              <Card style={{ width: '100%' }}>
                <Paragraph>
                  <strong>{item.from_user?.name || 'Someone'}</strong> owes{' '}
                  <strong>{item.to_user?.name || 'Someone'}</strong> ₹{item.amount}
                </Paragraph>
                <Paragraph>
                  <strong>Group:</strong> {item.group_id?.name || 'Unknown'}
                </Paragraph>
                <Paragraph>
                  <Tag color={item.is_settled ? 'green' : 'red'}>
                    {item.is_settled ? 'Settled' : 'Pending'}
                  </Tag>
                  {item.is_settled && item.settled_on && (
                    <span style={{ marginLeft: 10 }}>
                      Settled on: {new Date(item.settled_on).toLocaleDateString()}
                    </span>
                  )}
                </Paragraph>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No settlements found" />
      )}
    </div>
  );
};

export default SettlementList;
