import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SiteLanguageProvider } from "./contexts/SiteLanguageContext";

createRoot(document.getElementById("root")!).render(
	<SiteLanguageProvider>
		<App />
	</SiteLanguageProvider>
);
