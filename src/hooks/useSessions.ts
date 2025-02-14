import {
  ChatSessionListItem,
  loadChatSessions,
} from '@/lib/chatSessionService';
import { useCallback, useEffect, useState } from 'react';

export const useSessions = () => {
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [sessionsCursor, setSessionsCursor] = useState<number | null>(null);

  const loadMoreChatSessions = useCallback(async () => {
    const SESSIONS_TO_LOAD_MORE = 10;
    if (sessionsCursor == null) return;

    try {
      const more = await loadChatSessions(
        sessionsCursor,
        SESSIONS_TO_LOAD_MORE,
      );
      setSessions([...sessions, ...more]);

      // if # of loaded session is less than the requested number,
      // it means there are no more sessions to load, so set the cursor to null
      if (more.length < SESSIONS_TO_LOAD_MORE) {
        setSessionsCursor(null);
      } else {
        setSessionsCursor(more[more.length - 1].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [sessionsCursor, sessions]);

  useEffect(() => {
    (async () => {
      const SESSIONS_TO_LOAD_FIRST = 30;
      try {
        const data = await loadChatSessions(undefined, SESSIONS_TO_LOAD_FIRST);
        setSessions(data);
        if (data.length > 0) {
          setSessionsCursor(data[data.length - 1].id);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return {
    sessions,
    loadMoreChatSessions,
    sessionsCursor,
  };
};
