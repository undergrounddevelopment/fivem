const fs = require('fs');
const path = require('path');
const config = require('../../config');

const vouchDbPath = path.join(__dirname, '..', 'database', 'vouches.json');

function loadVouches() {
    if (!fs.existsSync(vouchDbPath)) {
        fs.writeFileSync(vouchDbPath, JSON.stringify({ vouches: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(vouchDbPath, 'utf8'));
}

function saveVouches(data) {
    fs.writeFileSync(vouchDbPath, JSON.stringify(data, null, 2));
}

function hasVouch(userId) {
    const data = loadVouches();
    return data.vouches[userId] && data.vouches[userId].active;
}

function addVouch(userId, messageId, content) {
    const data = loadVouches();
    data.vouches[userId] = {
        messageId,
        content,
        timestamp: new Date().toISOString(),
        active: true
    };
    saveVouches(data);
}

function removeVouch(userId) {
    const data = loadVouches();
    if (data.vouches[userId]) {
        data.vouches[userId].active = false;
        data.vouches[userId].deletedAt = new Date().toISOString();
        saveVouches(data);
    }
}

function getVouch(userId) {
    const data = loadVouches();
    return data.vouches[userId];
}

function getVouchByMessageId(messageId) {
    const data = loadVouches();
    for (const [userId, vouch] of Object.entries(data.vouches)) {
        if (vouch.messageId === messageId) {
            return { userId, ...vouch };
        }
    }
    return null;
}

async function banUser(client, userId, reason) {
    try {
        const guild = await client.guilds.fetch(config.discord.guildId);
        await guild.members.ban(userId, { reason });
        return true;
    } catch (error) {
        console.error(`Failed to ban user ${userId}:`, error);
        return false;
    }
}

module.exports = {
    hasVouch,
    addVouch,
    removeVouch,
    getVouch,
    getVouchByMessageId,
    banUser
};
