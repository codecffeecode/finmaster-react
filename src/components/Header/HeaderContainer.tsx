import HeaderComponent from "./HeaderComponent";

const HeaderContainer = (Component: any) => {
    return (props: any) => {
        return <Component  />
    }
}
export const Header = HeaderContainer(HeaderComponent);
export default Header;