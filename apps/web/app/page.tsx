import { ChatShell } from "@/components/chat-shell";
import { ProfileColumn } from "@/components/profile-column";

export default function Home() {
  return (
    <main className="portfolio-page">
      <div className="layout-shell">
        <ProfileColumn />

        <aside className="chat-column">
          <ChatShell />
        </aside>
      </div>
    </main>
  );
}
