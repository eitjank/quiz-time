import { Paper } from '@mantine/core';

const BorderedCard = ({ children, style, ...props }) => {

  return (
    <Paper
      shadow="md"
      radius="md"
      withBorder 
      style={{
        marginBottom: '20px',
        padding: '10px 10px 15px', 
        ...style,
      }}
      data-testid="bordered-card"
      {...props}
    >
      {children}
    </Paper>
  );
};

export default BorderedCard;
