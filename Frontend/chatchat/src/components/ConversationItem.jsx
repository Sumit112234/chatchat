import React from 'react';
import { Users } from 'lucide-react';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(conversation)}
      className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-700'
          : 'hover:bg-gray-100 dark:hover:bg-blue-700/50'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          {conversation.isGroup ? (
            <Users className="h-10 w-10 text-blue-500 dark:text-blue-300 p-2 bg-blue-100 dark:bg-blue-800 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-medium">
              {conversation.name.substring(0, 2)}
            </div>
          )}
          {conversation.status === 'online' && (
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-blue-800"></span>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {conversation.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300 truncate w-40">
            {conversation.lastMessage}
          </div>
        </div>
      </div>
      {conversation.unread > 0 && (
        <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
          {conversation.unread}
        </span>
      )}
    </button>
  );
};

export default ConversationItem;