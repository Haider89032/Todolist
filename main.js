


// متغيرات للحفظ في localStorage
let users = JSON.parse(localStorage.getItem('chat-users')) || {};
let servers = JSON.parse(localStorage.getItem('chat-servers')) || {};
let currentUser = JSON.parse(localStorage.getItem('current-user')) || null;
let currentServerId = null;

// عناصر DOM - التسجيل والدخول
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerFormContainer = document.getElementById('register-form-container');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const logoutBtn = document.getElementById('logout-btn');
const displayUsername = document.getElementById('display-username');

// عناصر DOM - السيرفرات والدردشة
const createServerBtn = document.getElementById('create-server-btn');
const joinServerBtn = document.getElementById('join-server-btn');
const serverInfoBtn = document.getElementById('server-info-btn');
const myServersList = document.getElementById('my-servers');
const welcomeMessage = document.getElementById('welcome-message');
const serverChat = document.getElementById('server-chat');
const serverTitle = document.getElementById('server-title');
const messageForm = document.getElementById('message-form');

// عناصر DOM - Modal
const createServerModal = document.getElementById('create-server-modal');
const joinServerModal = document.getElementById('join-server-modal');
const serverInfoModal = document.getElementById('server-info-modal');
const createServerForm = document.getElementById('create-server-form');
const joinServerForm = document.getElementById('join-server-form');
const closeButtons = document.querySelectorAll('.close');

// التبديل بين تسجيل الدخول وإنشاء حساب
switchToRegister.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.auth-form').classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
});

switchToLogin.addEventListener('click', function(e) {
    e.preventDefault();
    registerFormContainer.classList.add('hidden');
    document.querySelector('.auth-form').classList.remove('hidden');
});

// إنشاء حساب جديد
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('كلمات المرور غير متطابقة');
        return;
    }
    
    if (users[username]) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }
    
    users[username] = {
        username,
        email,
        password,
        servers: []
    };
    
    localStorage.setItem('chat-users', JSON.stringify(users));
    
    alert('تم إنشاء الحساب بنجاح');
    registerForm.reset();
    registerFormContainer.classList.add('hidden');
    document.querySelector('.auth-form').classList.remove('hidden');
});

// تسجيل الدخول
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        localStorage.setItem('current-user', JSON.stringify(currentUser));
        
        displayUsername.textContent = currentUser.username;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        updateServersList();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
});

// تسجيل الخروج
logoutBtn.addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('current-user');
    
    appContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    loginForm.reset();
});

// فتح الـ modal لإنشاء سيرفر
createServerBtn.addEventListener('click', function() {
    createServerModal.style.display = 'flex';
});

// فتح الـ modal للانضمام لسيرفر
joinServerBtn.addEventListener('click', function() {
    joinServerModal.style.display = 'flex';
});

// فتح الـ modal لمعلومات السيرفر - تم إصلاحه
serverInfoBtn.addEventListener('click', function() {
    showServerInfo(); // استدعاء الدالة بشكل صحيح
});

// إغلاق الـ modal
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        createServerModal.style.display = 'none';
        joinServerModal.style.display = 'none';
        serverInfoModal.style.display = 'none';
    });
});

// إنشاء معرف فريد
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// إنشاء رمز فريد
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// إنشاء سيرفر جديد
createServerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    const serverName = document.getElementById('server-name').value;
    const serverDesc = document.getElementById('server-desc').value;
    const serverId = generateId();
    const serverCode = generateCode();
    
    servers[serverId] = {
        id: serverId,
        code: serverCode,
        name: serverName,
        description: serverDesc,
        owner: currentUser.username,
        members: [currentUser.username],
        messages: []
    };
    
    if (!currentUser.servers) {
        currentUser.servers = [];
    }
    
    currentUser.servers.push(serverId);
    users[currentUser.username] = currentUser;
    
    localStorage.setItem('chat-servers', JSON.stringify(servers));
    localStorage.setItem('chat-users', JSON.stringify(users));
    localStorage.setItem('current-user', JSON.stringify(currentUser));
    
    createServerModal.style.display = 'none';
    createServerForm.reset();
    
    updateServersList();
    showServerChat(serverId);
});

// الانضمام إلى سيرفر
joinServerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    const serverId = document.getElementById('server-id').value;
    const serverCode = document.getElementById('server-code').value;
    
    if (servers[serverId] && servers[serverId].code === serverCode) {
        if (!currentUser.servers) {
            currentUser.servers = [];
        }
        
        if (!currentUser.servers.includes(serverId)) {
            currentUser.servers.push(serverId);
        }
        
        if (!servers[serverId].members.includes(currentUser.username)) {
            servers[serverId].members.push(currentUser.username);
        }
        
        users[currentUser.username] = currentUser;
        
        localStorage.setItem('chat-servers', JSON.stringify(servers));
        localStorage.setItem('chat-users', JSON.stringify(users));
        localStorage.setItem('current-user', JSON.stringify(currentUser));
        
        joinServerModal.style.display = 'none';
        joinServerForm.reset();
        
        updateServersList();
        showServerChat(serverId);
    } else {
        alert('معرف السيرفر أو الرمز غير صحيح');
    }
});

// إرسال رسالة
messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser || !currentServerId) {
        return;
    }
    
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        const message = {
            text: messageText,
            sender: currentUser.username,
            timestamp: new Date().getTime()
        };
        
        servers[currentServerId].messages.push(message);
        localStorage.setItem('chat-servers', JSON.stringify(servers));
        
        displayMessages();
        messageInput.value = '';
    }
});

// تحديث قائمة السيرفرات
function updateServersList() {
    myServersList.innerHTML = '';
    
    if (!currentUser || !currentUser.servers || !currentUser.servers.length) {
        return;
    }
    
    currentUser.servers.forEach(serverId => {
        if (servers[serverId]) {
            const li = document.createElement('li');
            li.textContent = servers[serverId].name;
            li.dataset.id = serverId;
            
            if (currentServerId === serverId) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', function() {
                showServerChat(serverId);
            });
            
            myServersList.appendChild(li);
        }
    });
}

// عرض معلومات السيرفر - تم إصلاحه
function showServerInfo() {
    if (!currentServerId || !servers[currentServerId]) {
        alert('الرجاء اختيار سيرفر أولاً');
        return;
    }
    
    document.getElementById('info-name').textContent = servers[currentServerId].name;
    document.getElementById('info-id').textContent = currentServerId;
    document.getElementById('info-code').textContent = servers[currentServerId].code;
    document.getElementById('info-desc').textContent = servers[currentServerId].description || 'لا يوجد وصف';
    
    serverInfoModal.style.display = 'flex';
}

// عرض الدردشة - تم تحسينه
function showServerChat(serverId) {
    if (!servers[serverId]) {
        return;
    }
    
    currentServerId = serverId;
    
    // تحديث قائمة السيرفرات لتحديد السيرفر النشط
    document.querySelectorAll('#my-servers li').forEach(li => {
        li.classList.remove('active');
        if (li.dataset.id === serverId) {
            li.classList.add('active');
        }
    });
    
    welcomeMessage.classList.add('hidden');
    serverChat.classList.remove('hidden');
    
    serverTitle.textContent = servers[serverId].name;
    
    // تحديث معلومات السيرفر مباشرة عند اختياره
    document.getElementById('info-name').textContent = servers[serverId].name;
    document.getElementById('info-id').textContent = serverId;
    document.getElementById('info-code').textContent = servers[serverId].code;
    document.getElementById('info-desc').textContent = servers[serverId].description || 'لا يوجد وصف';
    
    displayMessages();
}

// عرض الرسائل - تم تحسينه
function displayMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    if (!currentServerId || !servers[currentServerId] || !servers[currentServerId].messages) {
        return;
    }
    
    servers[currentServerId].messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === currentUser.username ? 'user' : 'other'}`;
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = msg.sender === currentUser.username ? 'أنت' : msg.sender;
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = msg.text;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString();
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageText);
        messageDiv.appendChild(timestamp);
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // التمرير إلى آخر رسالة
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// تكيف واجهة المستخدم مع حجم الشاشة
function adjustUIForScreenSize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // تعديلات للهاتف المحمول
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.classList.contains('btn-small')) {
                btn.style.padding = '8px 15px';
            }
        });
    } else {
        // تعديلات للشاشات الكبيرة
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.classList.contains('btn-small')) {
                btn.style.padding = '10px 20px';
            }
        });
    }
}

// تهيئة التطبيق
function initApp() {
    // ضبط واجهة المستخدم حسب حجم الشاشة
    adjustUIForScreenSize();
    
    if (currentUser) {
        displayUsername.textContent = currentUser.username;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        updateServersList();
        
        if (currentUser.servers && currentUser.servers.length > 0 && servers[currentUser.servers[0]]) {
            showServerChat(currentUser.servers[0]);
        }
    }
    
    // إضافة event listener للنقر خارج الـ modal لإغلاقه
    window.addEventListener('click', function(e) {
        if (e.target === createServerModal) {
            createServerModal.style.display = 'none';
        }
        if (e.target === joinServerModal) {
            joinServerModal.style.display = 'none';
        }
        if (e.target === serverInfoModal) {
            serverInfoModal.style.display = 'none';
        }
    });
    
    // التعامل مع إعادة تحجيم النافذة للتصميم المتجاوب
    window.addEventListener('resize', function() {
        adjustUIForScreenSize();
    });
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
let settings = JSON.parse(localStorage.getItem('chat-settings')) || {
    theme: 'light',
    language: 'ar'
};

// عناصر DOM الجديدة
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const imageUpload = document.getElementById('image-upload');
const audioUpload = document.getElementById('audio-upload');
const themeOptions = document.querySelectorAll('input[name="theme"]');
const languageSelect = document.getElementById('language-select');

// إضافة تبديل القائمة الجانبية في وضع الهاتف
sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    
    // إنشاء طبقة شفافة للنقر عليها لإغلاق القائمة
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.querySelector('.main-content').appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    overlay.classList.toggle('active');
});

// فتح modal الإعدادات
settingsBtn.addEventListener('click', function() {
    // تعيين الإعدادات الحالية
    document.querySelector(`input[name="theme"][value="${settings.theme}"]`).checked = true;
    languageSelect.value = settings.language;
    
    settingsModal.style.display = 'flex';
});

// حفظ الإعدادات
document.querySelectorAll('input[name="theme"], #language-select').forEach(input => {
    input.addEventListener('change', function() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        const selectedLanguage = languageSelect.value;
        
        settings.theme = selectedTheme;
        settings.language = selectedLanguage;
        
        localStorage.setItem('chat-settings', JSON.stringify(settings));
        
        applySettings();
    });
});

// تطبيق الإعدادات
function applySettings() {
    // تطبيق الثيم
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // تطبيق اللغة (هنا يمكن إضافة كود للترجمة)
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    // إعادة تعيين بعض العناصر حسب اللغة
    const isRTL = settings.language === 'ar';
    document.querySelectorAll('.message-input-container').forEach(container => {
        container.style.marginLeft = isRTL ? '10px' : '0';
        container.style.marginRight = isRTL ? '0' : '10px';
    });
}

// إرسال صورة
imageUpload.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            sendMediaMessage('image', e.target.result);
            // إعادة تعيين قيمة الإدخال للسماح بتحميل نفس الملف مرة أخرى
            imageUpload.value = '';
        };
        
        reader.readAsDataURL(this.files[0]);
    }
});

// إرسال تسجيل صوتي
audioUpload.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            sendMediaMessage('audio', e.target.result);
            // إعادة تعيين قيمة الإدخال للسماح بتحميل نفس الملف مرة أخرى
            audioUpload.value = '';
        };
        
        reader.readAsDataURL(this.files[0]);
    }
});

// إرسال رسالة وسائط
function sendMediaMessage(type, data) {
    if (!currentUser || !currentServerId) {
        return;
    }
    
    const message = {
        text: '',
        mediaType: type,
        mediaData: data,
        sender: currentUser.username,
        timestamp: new Date().getTime()
    };
    
    servers[currentServerId].messages.push(message);
    localStorage.setItem('chat-servers', JSON.stringify(servers));
    
    displayMessages();
}

// تعديل دالة عرض الرسائل لدعم الوسائط
function displayMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    if (!currentServerId || !servers[currentServerId] || !servers[currentServerId].messages) {
        return;
    }
    
    servers[currentServerId].messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === currentUser.username ? 'user' : 'other'}`;
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = msg.sender === currentUser.username ? 'أنت' : msg.sender;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // إضافة النص إذا وجد
        if (msg.text) {
            const messageText = document.createElement('div');
            messageText.className = 'message-text';
            messageText.textContent = msg.text;
            messageContent.appendChild(messageText);
        }
        
        // إضافة الوسائط إذا وجدت
        if (msg.mediaType) {
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'message-media';
            
            if (msg.mediaType === 'image') {
                const img = document.createElement('img');
                img.src = msg.mediaData;
                img.alt = 'صورة';
                img.addEventListener('click', function() {
                    // يمكن إضافة وظيفة لعرض الصورة بحجم كبير
                    window.open(msg.mediaData, '_blank');
                });
                mediaContainer.appendChild(img);
            } else if (msg.mediaType === 'audio') {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = msg.mediaData;
                mediaContainer.appendChild(audio);
            }
            
            messageContent.appendChild(mediaContainer);
        }
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString();
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // التمرير إلى آخر رسالة
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// تعديل initApp لتطبيق الإعدادات عند التشغيل
function initApp() {
    // تطبيق الإعدادات المحفوظة
    applySettings();
    
    // ضبط واجهة المستخدم حسب حجم الشاشة
    adjustUIForScreenSize();
    
    if (currentUser) {
        displayUsername.textContent = currentUser.username;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        updateServersList();
        
        if (currentUser.servers && currentUser.servers.length > 0 && servers[currentUser.servers[0]]) {
            showServerChat(currentUser.servers[0]);
        }
    }
    
    // إضافة event listener للنقر خارج الـ modal لإغلاقه
    window.addEventListener('click', function(e) {
        if (e.target === createServerModal) {
            createServerModal.style.display = 'none';
        }
        if (e.target === joinServerModal) {
            joinServerModal.style.display = 'none';
        }
        if (e.target === serverInfoModal) {
            serverInfoModal.style.display = 'none';
        }
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // إغلاق القائمة الجانبية عند تغيير حجم النافذة للشاشات الكبيرة
    window.addEventListener('resize', function() {
        adjustUIForScreenSize();
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    });
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});


