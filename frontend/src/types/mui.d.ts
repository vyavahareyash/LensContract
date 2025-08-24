import { GridProps } from '@mui/material/Grid';

declare module '@mui/material/Grid' {
  interface GridPropsOverrides {
    item: true;
    container: true;
  }
}
