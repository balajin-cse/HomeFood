import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color, size }) => {
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Cook':
        return focused ? 'chef-hat' : 'chef-hat';
      case 'Orders':
        return focused ? 'clipboard-list' : 'clipboard-list-outline';
      case 'Profile':
        return focused ? 'account' : 'account-outline';
      default:
        return 'help';
    }
  };

  return (
    <MaterialCommunityIcons
      name={getIconName(name) as any}
      size={size}
      color={color}
    />
  );
};

export default TabBarIcon;