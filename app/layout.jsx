import "./globals.css";

export const metadata = {
  title: "CodeTogether",
  description: "Real-time collaborative code editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}