import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';

const BorderedCard = ({ children, style, ...props }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Paper
      shadow="md"
      radius="md"
      style={{
        border: `1px solid ${
          colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
        }`,
        marginBottom: '20px',
        padding: '10px 10px 20px', 
        ...style,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default BorderedCard;
