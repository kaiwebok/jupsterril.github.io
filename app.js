import { _0xdispatch, _0x_get_history } from './core.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

const botpfp = 'https://i.ibb.co/Kpm3Z25g/Untitled555-20250817144624.png';

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

function appendMessage(role, content) {
    if (role === 'system') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.textContent = content;
        chatContainer.appendChild(msgDiv);
    } else {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${role}`;

        if (role === 'ai') {
            const img = document.createElement('img');
            img.src = botpfp;
            img.className = 'message-pfp';
            img.alt = 'Kai';
            wrapper.appendChild(img);
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        if (role === 'ai') {
            const cleanHtml = DOMPurify.sanitize(marked.parse(content));
            msgDiv.innerHTML = cleanHtml;
        } else {
            msgDiv.textContent = content;
        }
        
        wrapper.appendChild(msgDiv);
        chatContainer.appendChild(wrapper);
    }
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // User Message
    appendMessage('user', text);
    
    // Loading State
    typingIndicator.classList.remove('hidden');
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const result = await _0xdispatch(text);
        typingIndicator.classList.add('hidden');

        if (result.error) {
            // Normalize possible error shapes
            const errObj = (typeof result.error === 'object') ? result.error : { message: String(result.error) };
            const code = errObj.code || errObj.status || errObj.error || null;
            const msg = errObj.message || errObj.error_description || String(errObj);

            // Map common error codes/statuses to friendly AI responses
            let botReply;
            switch (String(code).toLowerCase()) {
                case '401':
                case 'unauthorized':
                case 'invalid_api_key':
                    botReply = "yo i can't access my brain rn — looks like an auth problem, ngl. try checking the api key.";
                    break;
                case '403':
                case 'forbidden':
                    botReply = "i wanna help but i'm blocked from that resource. maybe permissions are funky.";
                    break;
                case '429':
                case 'rate_limit_exceeded':
                case 'too_many_requests':
                    botReply = "whoa slow down — i'm getting hammered. try again in a sec, k?";
                    break;
                case '500':
                case 'internal_server_error':
                    botReply = "my server-side brain's shorting out rn. try again later, sry!";
                    break;
                case '503':
                case 'service_unavailable':
                    botReply = "service's taking a nap. i'll be back when it's up — try again soon.";
                    break;
                case 'network':
                case 'network_error':
                    botReply = "network's being sus rn — check your connection and try again.";
                    break;
                default:
                    // Fallback uses provided message (kept concise)
                    botReply = msg ? `hmm i hit an error: ${msg}` : "something weird happened, i couldn't get a reply.";
            }

            // Append as the AI speaking about the error
            appendMessage('ai', botReply);
            // Also log full error object for debugging
            console.warn('AI API error:', errObj);
        } else if (result.candidates && result.candidates[0].content) {
            const responseText = result.candidates[0].content.parts[0].text;
            appendMessage('ai', responseText);
        } else {
            console.log(result);
            appendMessage('system', "Connection interrupted. Trace logs wiped.");
        }
    } catch (err) {
        typingIndicator.classList.add('hidden');
        appendMessage('system', "NEURAL_LINK_FAILURE: Check console for sanitized errors.");
    }
}

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// Initialize history on load
function initHistory() {
    const history = _0x_get_history();
    history.forEach(msg => {
        const role = Object.keys(msg)[0];
        const content = msg[role];
        appendMessage(role === "AI" ? "ai" : "user", content);
    });
}

initHistory();

// Sanitize console on start
console.log("%c SECURITY OVERRIDE ACTIVE ", "background: red; color: white; font-weight: bold;");
console.log("WATCHU DOIN HERE BROCHACHO");
