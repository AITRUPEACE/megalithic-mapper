import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DevModeWrapper } from "@/components/dev/dev-mode-wrapper";
import { ThemeProvider } from "@/shared/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
	title: "Megalithic Mapper | Ancient Civilizations Research Network",
	description: "Collaborative platform for mapping ancient sites, sharing media, and advancing research hypotheses across global civilizations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground min-h-screen`}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<DevModeWrapper>
						<AuthProvider>{children}</AuthProvider>
					</DevModeWrapper>
				</ThemeProvider>
			</body>
		</html>
	);
}
