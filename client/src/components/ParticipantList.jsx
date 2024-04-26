import { Grid, Text } from '@mantine/core';
import BorderedCard from './BorderedCard';

const ParticipantList = ({ participants }) => (
  <Grid>
    {participants.map((participant) => (
      <Grid.Col span={4} key={participant.id}>
        <BorderedCard>
          <Text size="lg">{participant.name}</Text>
        </BorderedCard>
      </Grid.Col>
    ))}
  </Grid>
);

export default ParticipantList;