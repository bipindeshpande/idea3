import Navigation from "../components/common/Navigation.jsx";
import Footer from "../components/common/Footer.jsx";

export default function MarketingLayout({ children, fullWidth = false }) {
 return (
    <div className="app-shell bg-app text-primary font-sans">
 <Navigation />
 <main className={fullWidth ? "w-full px-6 py-10" : "page-wrap px-6 py-10"}>
 {children}
 </main>
 <Footer />
 </div>
 );
}


