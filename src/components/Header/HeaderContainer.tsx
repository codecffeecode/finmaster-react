import HeaderComponent from "./HeaderComponent";
import { ComponentType } from 'react';

const HeaderContainer = (Component: ComponentType) => {
  const WrappedComponent = () => {
    return <Component />;
  };
  
  WrappedComponent.displayName = 'Header';
  
  return WrappedComponent;
};

export const Header = HeaderContainer(HeaderComponent);
export default Header;