import React from 'react';
import { Box } from '@chakra-ui/react';
import { Icon, IconProps } from '@chakra-ui/icons';

interface CustomButtonProps {
  icon: React.ComponentType<IconProps>;
  color: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

const C_DEFAULT = '#00FFFF';
const C_PENDING = '#00FFFF33';
const C_PRIMARY = '#00FFFF';

const CustomButton: React.FC<CustomButtonProps> = (props) => {
  const { icon, color, onClick, disabled } = props;

  return (
    <Box
      as="button"
      width="100px"
      height="100px"
      onClick={onClick}
      disabled={disabled}
      backgroundColor="transparent"
      border={`2px solid ${color === 'primary' ? C_PRIMARY : C_DEFAULT}`}
      color={color === 'primary' ? C_PRIMARY : C_DEFAULT}
      borderRadius="50px"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      fontSize="1.5rem"
      fontFamily="'Roboto Mono', monospace"
      transition="opacity 0.2s"
      _hover={{ opacity: 0.8 }}
      _active={{ opacity: 0.6 }}
      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} boxSize={40} />
    </Box>
  );
};

export default CustomButton;
