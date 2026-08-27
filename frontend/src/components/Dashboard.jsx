import PlatformStatus from './PlatformStatus';
import MessageSimulator from './MessageSimulator';
import PromptEditor from './PromptEditor';

function Dashboard() {
  return (
    <main className="flex-1 flex flex-col gap-6 p-8 max-w-[850px] mx-auto w-full">
      <PlatformStatus />
      <MessageSimulator />
      <PromptEditor />
    </main>
  );
}

export default Dashboard;
