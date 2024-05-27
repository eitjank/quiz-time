import { Grid, Text, useMantineColorScheme } from '@mantine/core';
import BorderedCard from '../BorderedCard/BorderedCard';

const ParticipantList = ({ participants, currentUserId }) => {
  const { colorScheme } = useMantineColorScheme();
  const borderColor = colorScheme === 'dark' ? '#888' : '#333';

  return (
    <Grid>
      {participants.map((participant) => (
        <Grid.Col span={4} key={participant.id}>
          <BorderedCard
            style={{
              border:
                participant.id === currentUserId
                  ? `1px solid ${borderColor}`
                  : '',
            }}
          >
            <Text
              size="lg"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            >
              {participant.name}
            </Text>
          </BorderedCard>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ParticipantList;
