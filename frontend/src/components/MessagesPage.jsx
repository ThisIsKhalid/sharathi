import ConversationsPanel from './ConversationsPanel';

function MessagesPage() {
  return (
    <main className="flex-1 flex flex-col p-6 md:p-8 max-w-[1200px] mx-auto w-full">
      <ConversationsPanel fullHeight />
    </main>
  );
}

export default MessagesPage;
