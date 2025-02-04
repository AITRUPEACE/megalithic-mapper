import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Megalithic Sites Map",
	description: "Discover and explore ancient megalithic sites around the world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="light" style={{ colorScheme: "light" }}>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
