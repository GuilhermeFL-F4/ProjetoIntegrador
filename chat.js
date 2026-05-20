// A URL do seu Webhook do n8n.
// VOCÊ DEVE SUBSTITUIR ESTA URL PELA SUA REAL URL DO WEBHOOK NO N8N
const N8N_WEBHOOK_URL = "https://izysoft-n8n-n8n.3amk2h.easypanel.host/webhook/projeto_integrador"; 



function LoadName() {
            const savedConfig = localStorage.getItem('chatbotConfig');
            const nameSpan = document.getElementById('nome-chat');
            const nameTitle = document.getElementById('nome-titulo');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                nameSpan.textContent = `🤖 ${config.nome}`
                nameTitle.textContent = `${config.nome}`
            }
        };
document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

window.onload = LoadName;

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (sender === 'user') {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('bot-message');
    }

    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message === "") return;

    // 1. Mostrar a mensagem do usuário no chat
    appendMessage('user', message);
    userInput.value = ''; // Limpa o campo de input

    // 2. Carregar as configurações salvas
    const configString = localStorage.getItem('chatbotConfig');
    const config = configString ? JSON.parse(configString) : {
        nome: "Assistente",
        tom: "descontraido",
        instrucoes: "Você é um assistente prestativo."
    };

    // 3. Montar o JSON para a API (n8n Webhook)
    const payload = {
        message: message, // Mensagem enviada pelo chat
        config: config     // Todas as informações salvas na página de configuração
    };

    // 4. Chamar a API (Webhook do n8n)
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // 5. Apresentar a resposta da IA no chat
        // Espera-se que o n8n retorne um JSON com o campo 'reply' ou 'message'
        const botReply = data.reply || data.message || "Desculpe, não entendi a resposta do servidor.";
        appendMessage('bot', botReply);

    } catch (error) {
        console.error('Erro ao comunicar com Servidor:', error);
        appendMessage('bot', `⚠️ Ocorreu um erro ao conectar com o serviço (${error.message})`);
    }
}