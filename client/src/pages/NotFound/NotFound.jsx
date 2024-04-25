import React from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import './NotFound.css';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container className="root">
      <Title align="center" className="label">
        404
      </Title>
      <Title className="title">You have found a secret place.</Title>
      <Text c="dimmed" size="lg" ta="center" className="description">
        Unfortunately, this is only a 404 page. You may have mistyped the
        address, or the page has been moved to another URL.
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" onClick={() => navigate('/')}>
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
};

export default NotFound;
