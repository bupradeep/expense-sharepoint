import * as React from 'react';
import { Toggle, IToggleProps } from '@fluentui/react/lib/Toggle';

// Drop-in replacement for Fluent's Toggle with the app's corporate light-blue on/off
// styling, so every "Active"/filter switch in the admin area looks the same.
const ActiveToggle: React.FC<IToggleProps> = (props) => (
  <Toggle
    {...props}
    styles={(styleProps) => ({
      pill: {
        backgroundColor: styleProps.checked ? '#c7e0f4' : '#f3f2f1',
        borderColor: styleProps.checked ? '#c7e0f4' : '#c8c6c4',
        selectors: {
          ':hover': {
            backgroundColor: styleProps.checked ? '#b4d6ef' : '#edebe9',
            borderColor: styleProps.checked ? '#b4d6ef' : '#c8c6c4'
          }
        }
      },
      thumb: {
        backgroundColor: styleProps.checked ? '#0078d4' : '#605e5c'
      }
    })}
  />
);

export default ActiveToggle;
