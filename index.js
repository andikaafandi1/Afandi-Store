/*
 * Base Siputzx
 * Created By Afandi Digital
 */

require("./config");
const {
  default: makeWASocket,
  DisconnectReason,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
  useMultiFileAuthState,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline");
const PhoneNumber = require("awesome-phonenumber");
const figlet = require("figlet");
const FileType = require("file-type");
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
} = require("./lib/exif");
const {
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetch,
  await,
  sleep,
  reSize,
} = require("./lib/myfunc");
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};
const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
};

console.log(
  color(
    figlet.textSync("Afandi Digital", {
      font: "DOS Rebel",
      horizontalLayout: "default",
      vertivalLayout: "default",
      width: 100,
      whitespaceBreak: false,
    }),
    "pink"
  )
);

console.log(
  chalk.white.bold(`${chalk.green.bold("📃  Informasi :")}         
✉️  Script Base - Store
✉️  Author : Afandi
✉️  Gmail : andikaafandi20199@gmail.com
✉️  Instagram : https://www.instagram.com/andikaafandii

${chalk.green.bold("Script Made By Afandi Digital :D")}\n`)
);

async function startBotz() {
  const { state, saveCreds } = await useMultiFileAuthState("RafaelCreds");
  const Rafael = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
  });
  if (!Rafael.authState.creds.registered) {
    const phoneNumber = await question(
      "Masukan Nomor Bot Anda, For Example: 6283857564133 :\n"
    );
    let code = await Rafael.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(chalk.green.bold(`Pairing Code :`, code));
  }

  store.bind(Rafael.ev);

  Rafael.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message =
        Object.keys(mek.message)[0] === "ephemeralMessage"
          ? mek.message.ephemeralMessage.message
          : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") return;
      if (!Rafael.public && !mek.key.fromMe && chatUpdate.type === "notify")
        return;
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      m = smsg(Rafael, mek, store);
      require("./case")(Rafael, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });

  // Setting
  Rafael.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };
  Rafael.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await Rafael.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      { quoted }
    ).then((response) => {
      fs.unlinkSync(buffer);
      return response;
    });
  };
  Rafael.getName = (jid, withoutContact = false) => {
    id = Rafael.decodeJid(jid);
    withoutContact = Rafael.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = Rafael.groupMetadata(id) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
              "international"
            )
        );
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === Rafael.decodeJid(Rafael.user.id)
          ? Rafael.user
          : store.contacts[id] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
        "international"
      )
    );
  };

  Rafael.public = true;

  Rafael.serializeM = (m) => smsg(Rafael, m, store);
  Rafael.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (
        reason === DisconnectReason.badSession ||
        reason === DisconnectReason.connectionClosed ||
        reason === DisconnectReason.connectionLost ||
        reason === DisconnectReason.connectionReplaced ||
        reason === DisconnectReason.restartRequired ||
        reason === DisconnectReason.timedOut
      ) {
        startBotz();
      } else if (reason === DisconnectReason.loggedOut) {
      } else {
        Rafael.end(`Unknown DisconnectReason: ${reason}|${connection}`);
      }
    } else if (connection === "open") {
      console.log("[Connected] " + JSON.stringify(Rafael.user.id, null, 2));
    }
  });

  Rafael.ev.on("creds.update", saveCreds);

  Rafael.sendText = (jid, text, quoted = "", options) =>
    Rafael.sendMessage(jid, { text: text, ...options }, { quoted });

  Rafael.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  Rafael.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await Rafael.getName(i + "@s.whatsapp.net"),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await Rafael.getName(
          i + "@s.whatsapp.net"
        )}\nFN:${await Rafael.getName(
          i + "@s.whatsapp.net"
        )}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      });
    }
  };
  Rafael.sendFile = async (
    jid,
    path,
    filename = "",
    caption = "",
    quoted,
    ptt = false,
    options = {}
  ) => {
    let type = await Rafael.getFile(path, true);
    let { res, data: file, filename: pathFile } = type;
    if ((res && res.status !== 200) || file.length <= 65536) {
      try {
        throw { json: JSON.parse(file.toString()) };
      } catch (e) {
        if (e.json) throw e.json;
      }
    }
    let opt = { filename };
    if (quoted) opt.quoted = quoted;
    if (!type) options.asDocument = true;
    let mtype = "",
      mimetype = type.mime,
      convert;
    if (
      /webp/.test(type.mime) ||
      (/image/.test(type.mime) && options.asSticker)
    )
      mtype = "sticker";
    else if (
      /image/.test(type.mime) ||
      (/webp/.test(type.mime) && options.asImage)
    )
      mtype = "image";
    else if (/video/.test(type.mime)) mtype = "video";
    else if (/audio/.test(type.mime))
      (convert = await (ptt ? toPTT : toAudio)(file, type.ext)),
        (file = convert.data),
        (pathFile = convert.filename),
        (mtype = "audio"),
        (mimetype = "audio/ogg; codecs=opus");
    else mtype = "document";
    if (options.asDocument) mtype = "document";

    let message = {
      ...options,
      caption,
      ptt,
      [mtype]: { url: pathFile },
      mimetype,
    };
    let m;
    try {
      m = await Rafael.sendMessage(jid, message, { ...opt, ...options });
    } catch (e) {
      console.error(e);
      m = null;
    } finally {
      if (!m)
        m = await Rafael.sendMessage(
          jid,
          { ...message, [mtype]: file },
          { ...opt, ...options }
        );
      return m;
    }
  };
  Rafael.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  return Rafael;
}

startBotz();

function smsg(Rafael, m, store) {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = Rafael.decodeJid(
      (m.fromMe && Rafael.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup) m.participant = Rafael.decodeJid(m.key.participant) || "";
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg =
      m.mtype == "viewOnceMessage"
        ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
        : m.message[m.mtype];
    m.body =
      m.message.conversation ||
      m.msg.caption ||
      m.msg.text ||
      (m.mtype == "listResponseMessage" &&
        m.msg.singleSelectReply.selectedRowId) ||
      (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
      (m.mtype == "viewOnceMessage" && m.msg.caption) ||
      m.text;
    let quoted = (m.quoted = m.msg.contextInfo
      ? m.msg.contextInfo.quotedMessage
      : null);
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = m.quoted[type];
      if (["productMessage"].includes(type)) {
        type = getContentType(m.quoted);
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === "string")
        m.quoted = {
          text: m.quoted,
        };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id
        ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
        : false;
      m.quoted.sender = Rafael.decodeJid(m.msg.contextInfo.participant);
      m.quoted.fromMe = m.quoted.sender === Rafael.decodeJid(Rafael.user.id);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        "";
      m.quoted.mentionedJid = m.msg.contextInfo
        ? m.msg.contextInfo.mentionedJid
        : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };
      let vM = (m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {}),
      }));
      m.quoted.delete = () =>
        Rafael.sendMessage(m.quoted.chat, { delete: vM.key });
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
        Rafael.copyNForward(jid, vM, forceForward, options);
      m.quoted.download = () => Rafael.downloadMediaMessage(m.quoted);
    }
  }
  if (m.msg.url) m.download = () => Rafael.downloadMediaMessage(m.msg);
  m.text =
    m.msg.text ||
    m.msg.caption ||
    m.message.conversation ||
    m.msg.contentText ||
    m.msg.selectedDisplayText ||
    m.msg.title ||
    "";
  m.reply = (text, chatId = m.chat, options = {}) =>
    Buffer.isBuffer(text)
      ? Rafael.sendMedia(chatId, text, "file", "", m, { ...options })
      : Rafael.sendText(chatId, text, m, { ...options });
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    Rafael.copyNForward(jid, m, forceForward, options);

  return m;
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
