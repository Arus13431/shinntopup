<template>
  <div class="ai-widget-container">
    <!-- Floating Trigger Button -->
    <button @click="toggleChat" class="btn-floating-ai shadow-lg" :class="{ 'active': isOpen }">
      <i v-if="!isOpen" class="bi bi-robot fs-4"></i>
      <i v-else class="bi bi-x-lg fs-5"></i>
      <span v-if="!isOpen && unread" class="unread-badge">1</span>
    </button>

    <!-- Chat Box Window -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-window glass-card d-flex flex-column">
        <!-- Header -->
        <div class="chat-header d-flex align-items-center gap-3 p-3 border-bottom border-secondary">
          <div class="bot-avatar">
            <i class="bi bi-robot text-white"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-bold">ShinnSupport AI</h6>
            <small class="text-accent d-flex align-items-center gap-1">
              <span class="online-indicator"></span> Online & Siap Bantu
            </small>
          </div>
        </div>

        <!-- Chat Body (Messages) -->
        <div class="chat-body flex-grow-1 p-3 overflow-y-auto" ref="chatBodyRef">
          <!-- Welcome Message -->
          <div class="message-wrapper bot">
            <div class="message-bubble">
              Halo Sobat Shinn! 👋 Saya <strong>ShinnSupport AI</strong>. Ada yang bisa saya bantu hari ini? 
              Kamu bisa tanya rekomendasi game, promo terbaru, atau panduan top-up!
            </div>
          </div>

          <!-- History Messages -->
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message-wrapper" 
            :class="msg.role"
          >
            <div class="message-bubble">
              <div v-if="msg.role === 'bot'" v-html="renderMarkdown(msg.content)"></div>
              <div v-else>{{ msg.content }}</div>
            </div>
          </div>

          <!-- Typewriter / Stream Message for Current AI Response -->
          <div v-if="isTyping" class="message-wrapper bot">
            <div class="message-bubble">
              <div v-if="currentTypingText" v-html="renderMarkdown(currentTypingText)"></div>
              <div v-else class="typing-loader">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Suggested Prompts Chips -->
        <div class="quick-prompts p-2 border-top border-secondary bg-dark-opacity d-flex gap-2 overflow-x-auto">
          <button 
            v-for="(prompt, i) in quickPromptsList" 
            :key="i" 
            @click="sendQuickPrompt(prompt)"
            class="btn btn-sm btn-quick-suggest text-nowrap"
            :disabled="isTyping"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- Chat Footer (Input) -->
        <form @submit.prevent="sendMessage" class="chat-footer p-3 border-top border-secondary d-flex gap-2">
          <input 
            v-model="userInput" 
            type="text" 
            class="form-control bg-transparent border-secondary text-white" 
            placeholder="Tulis pesan..." 
            :disabled="isTyping"
            ref="inputFieldRef"
          />
          <button type="submit" class="btn btn-shinn-primary px-3" :disabled="isTyping || !userInput.trim()">
            <i class="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import api from '../services/api.js';

const isOpen = ref(false);
const unread = ref(true);
const userInput = ref('');
const messages = ref([]);
const isTyping = ref(false);
const currentTypingText = ref('');

const chatBodyRef = ref(null);
const inputFieldRef = ref(null);

const quickPromptsList = [
  'Cara top-up?',
  'Game terpopuler?',
  'Promo aktif hari ini?',
  'Tanya game MOBA'
];

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  unread.value = false;
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
      inputFieldRef.value?.focus();
    });
  }
};

const sendQuickPrompt = (promptText) => {
  userInput.value = promptText;
  sendMessage();
};

// Auto scroll chat body ke paling bawah
const scrollToBottom = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

// Sederhanakan render markdown untuk chat bubble (bolds, links, lists)
const renderMarkdown = (text) => {
  if (!text) return '';
  let rendered = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-accent font-weight-bold" style="text-decoration: underline;">$1</a>')
    .replace(/\n/g, '<br/>')
    .replace(/- (.*?)(<br\/>|$)/g, '<li class="ms-3">$1</li>');
  return rendered;
};

// Typewriter Effect
const startTypewriter = (textToType) => {
  currentTypingText.value = '';
  isTyping.value = true;
  let index = 0;
  
  const timer = setInterval(() => {
    if (index < textToType.length) {
      currentTypingText.value += textToType.charAt(index);
      index++;
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      clearInterval(timer);
      // Simpan bot response ke array utama
      messages.value.push({
        role: 'bot',
        content: textToType
      });
      currentTypingText.value = '';
      isTyping.value = false;
      nextTick(() => {
        scrollToBottom();
        inputFieldRef.value?.focus();
      });
    }
  }, 12); // Kecepatan ketikan ideal (12ms/karakter)
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isTyping.value) return;

  // Masukkan pesan user
  messages.value.push({
    role: 'user',
    content: text
  });
  userInput.value = '';
  isTyping.value = true;
  
  nextTick(() => {
    scrollToBottom();
  });

  try {
    // Siapkan history untuk Gemini API context
    const historyPayload = messages.value.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content
    }));

    const response = await api.post('/api/ai/chat', {
      message: text,
      history: historyPayload.slice(0, -1) // Kirim history kecuali pesan terakhir yang baru saja diinput
    });

    if (response.data.success) {
      const aiResponse = response.data.response;
      startTypewriter(aiResponse);
    } else {
      throw new Error();
    }
  } catch (error) {
    isTyping.value = false;
    messages.value.push({
      role: 'bot',
      content: 'Aduh, maaf ya Sobat Shinn. Server asisten AI saya sedang tidak merespon. Silakan coba kirim ulang pesanmu!'
    });
    nextTick(() => {
      scrollToBottom();
    });
  }
};
</script>

<style scoped>
.ai-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

.btn-floating-ai {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  outline: none;
}

.btn-floating-ai:hover {
  transform: scale(1.08) rotate(5deg);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.5) !important;
}

.btn-floating-ai.active {
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  transform: rotate(90deg);
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ff3838;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 56, 56, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 56, 56, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 56, 56, 0); }
}

/* Chat Window */
.chat-window {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 360px;
  height: 500px;
  max-width: 90vw;
  max-height: 80vh;
  z-index: 9998;
  border-color: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.chat-header {
  background: rgba(23, 37, 53, 0.9);
}

.bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.online-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ff66;
  display: inline-block;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.chat-body {
  background-color: rgba(15, 25, 35, 0.95);
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user .message-bubble {
  background-color: var(--color-primary);
  color: white;
  border-bottom-right-radius: 2px;
}

.bot .message-bubble {
  background-color: var(--bg-tertiary);
  color: white;
  border-bottom-left-radius: 2px;
  border: 1px solid rgba(255,255,255,0.05);
}

/* Suggested chips styling */
.bg-dark-opacity {
  background-color: rgba(15, 25, 35, 0.5);
}

.quick-prompts::-webkit-scrollbar {
  height: 4px;
}

.btn-quick-suggest {
  background: rgba(26, 111, 212, 0.15);
  border: 1px solid rgba(26, 111, 212, 0.4);
  color: var(--color-accent);
  border-radius: 12px;
  font-size: 11px;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.btn-quick-suggest:hover {
  background: var(--color-primary);
  color: white;
}

/* Typing Loader Animation */
.typing-loader {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.typing-loader span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-muted);
  animation: typing 1s infinite alternate;
}

.typing-loader span:nth-child(2) { animation-delay: 0.2s; }
.typing-loader span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}

/* Slide transition */
.chat-slide-enter-active, .chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.chat-slide-enter-from, .chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
