// src/components/GroupList.jsx
import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const GroupList = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/groups');
        const data = await res.json();

        const userGroups = data.filter(group =>
          group.members.some(member =>
            String(member._id) === String(userId)
          )
        );

        setGroups(userGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchGroups();
    }
  }, [userId]);

  if (!userId) return <Empty description="User not logged in" />;
  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Your Groups</Title>
        <Button type="primary" onClick={() => navigate('/create-group')}>
          + Create Group
        </Button>
      </div>

      {groups.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={groups}
          renderItem={group => (
            <List.Item key={group._id}>
              <Card
                title={group.name}
                hoverable
                onClick={() => navigate(`/group/${group._id}`)}
              >
                <p><strong>Members:</strong> {group.members.map(m => m.name).join(', ')}</p>
                <p><strong>Created by:</strong> {group.created_by.name}</p>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="You are not in any groups" />
      )}
    </div>
  );
};

export default GroupList;
