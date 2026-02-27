import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../services/api';

interface ChatMessage {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
}

export function useProjectChat() {
  const route = useRoute();
  const projectId = computed(() => Number(route.params.id));

  const messages = ref<ChatMessage[]>([]);
  const newMessage = ref('');
  const loading = ref(false);
  const error = ref('');
  const chatContainer = ref<HTMLElement | null>(null);

  const fetchMessages = async () => {
    loading.value = true;
    error.value = '';

    try {
      const response = await apiClient.get(
        `/projects/${projectId.value}/messages`
      );
      messages.value = response.data.data || [];
      scrollToBottom();
    } catch (err: any) {
      error.value = err.message || 'Failed to load messages';
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    try {
      await apiClient.post(
        `/projects/${projectId.value}/messages`,
        { content: newMessage.value }
      );

      newMessage.value = '';
      await fetchMessages();
    } catch (err: any) {
      error.value = err.message || 'Failed to send message';
    }
  };

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop =
          chatContainer.value.scrollHeight;
      }
    });
  };

  onMounted(fetchMessages);

  return {
    messages,
    newMessage,
    loading,
    error,
    sendMessage,
    chatContainer
  };
}