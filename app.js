class BluetoothChat {
    constructor() {
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        this.initializeElements();
        this.addEventListeners();
    }

    initializeElements() {
        this.connectBtn = document.getElementById('connectBtn');
        this.sendBtn = document.getElementById('sendBtn');
        this.messageInput = document.getElementById('messageInput');
        this.chatContainer = document.getElementById('chatContainer');
        this.statusElement = document.getElementById('status');
    }

    addEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access', 'generic_attribute']
            });

            this.statusElement.textContent = 'Conectando...';
            this.server = await this.device.gatt.connect();
            
            // Obtener y mostrar servicios disponibles
            const services = await this.server.getPrimaryServices();
            console.log('Servicios disponibles:', services);
            
            // Mostrar características para cada servicio
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                console.log(`Características del servicio ${service.uuid}:`, characteristics);
            }

            this.statusElement.textContent = `Conectado a ${this.device.name}`;
            this.messageInput.disabled = false;
            this.sendBtn.disabled = false;

            this.device.addEventListener('gattserverdisconnected', () => this.handleDisconnection());

        } catch (error) {
            console.error('Error Bluetooth:', error);
            this.statusElement.textContent = `Error: ${error.message}`;
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            try {
                this.addMessageToChat(message, 'sent');
                // Aquí implementaremos el envío cuando tengamos la característica correcta
                this.messageInput.value = '';
            } catch (error) {
                console.error('Error al enviar:', error);
                this.statusElement.textContent = `Error al enviar: ${error.message}`;
            }
        }
    }

    addMessageToChat(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        this.chatContainer.appendChild(messageElement);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    handleDisconnection() {
        this.statusElement.textContent = 'Desconectado';
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        this.characteristic = null;
        this.service = null;
        this.server = null;
        this.device = null;
    }
}

// Inicializar la aplicación
window.addEventListener('load', () => {
    if (!navigator.bluetooth) {
        document.getElementById('status').textContent = 
            'Tu navegador no soporta Web Bluetooth';
        document.getElementById('connectBtn').disabled = true;
        return;
    }
    new BluetoothChat();
});
