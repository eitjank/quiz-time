import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';

export function render(ui) {
  return testingLibraryRender(
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {ui}
    </MantineProvider>
  );
}
