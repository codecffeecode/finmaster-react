import HeaderComponent from "./HeaderComponent";

const HeaderContainer = (Component: any) => {
    console.log("logging... header container....")
    return (props: any) => {
        return <Component  />
    }
}
export const Header = HeaderContainer(HeaderComponent);
export default Header;