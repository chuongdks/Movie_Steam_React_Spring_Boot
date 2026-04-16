import { Outlet } from "react-router-dom";

// Layout component is a Wrapper for others routes
const Layout = () => {
    return (
        <main>
            <Outlet/>
        </main>
    )
}

export default Layout