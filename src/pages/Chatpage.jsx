// pages/ChatPage.jsx
import { useParams } from "react-router-dom";

function ChatPage() {
  const { username } = useParams();

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-xl font-semibold mb-4">Chat with {username}</h1>

      {/* Replace this with mapped messages from backend */}
      <div className="space-y-2">
        <div className="bg-gray-100 p-2 rounded-lg w-fit">Hi 👋</div>
        <div className="bg-blue-100 p-2 rounded-lg w-fit ml-auto">Hello!</div>
      </div>

      {/* Message input */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Message..."
            className="flex-1 border rounded-full px-4 py-2"
          />
          <button className="text-blue-500 font-semibold">Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
