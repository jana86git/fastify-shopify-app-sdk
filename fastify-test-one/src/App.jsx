import { BrowserRouter, Link } from "react-router-dom";
import Routes from "./Routes";
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';




export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true });




  return (

    <BrowserRouter basename="/app-one">
      <AppProvider i18n={enTranslations}>
        <ui-title-bar title="Shop App Builder">
        </ui-title-bar>


        <ui-nav-menu>
          <Link to="/" rel="home">Home</Link>
          <Link to="/about">About</Link>
        </ui-nav-menu>


        {/* <LayoutUI title={"Product Obtimizer"} pages={pages}> */}
        <Routes pages={pages} />
        {/* </LayoutUI> */}
      </AppProvider>
    </BrowserRouter>

  );
}
