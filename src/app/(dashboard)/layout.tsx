import { TopNav } from "@/components/top-nav";
import { BottomTabBar } from "@/components/bottom-tab-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
