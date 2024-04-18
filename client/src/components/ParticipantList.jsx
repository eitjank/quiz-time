import { Grid, Paper, Text } from '@mantine/core';

const ParticipantList = ({ participants }) => (
  <Grid>
    {participants.map((participant) => (
      <Grid.Col span={4} key={participant.id}>
        <Paper shadow="md">
          <Text size="lg">{participant.name}</Text>
        </Paper>
      </Grid.Col>
    ))}
  </Grid>
);

export default ParticipantList;