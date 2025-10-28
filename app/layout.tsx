import "./globals.css";

export const metadata = {
	title: "Solana Poll DApp",
	description: "Create and vote on Solana polls",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-slate-100 text-slate-900 min-h-screen">
				<div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
			</body>
		</html>
	);
}
