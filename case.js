require("./config");
const {
  smsg,
  getGroupAdmins,
  formatp,
  formatDate,
  getTime,
  isUrl,
  await,
  sleep,
  clockString,
  msToDate,
  sort,
  toNumber,
  enumGetKey,
  runtime,
  fetchJson,
  getBuffer,
  jsonformat,
  delay,
  format,
  logic,
  generateProfilePicture,
  parseMention,
  getRandom,
  pickRandom,
  reSize,
} = require("./lib/myfunction");
const {
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
} = require("@whiskeysockets/baileys");
const axios = require("axios");
const os = require("os");
const fs = require("fs");
const {
  TelegraPh,
  UploadFileUgu,
  webp2mp4File,
  floNime,
} = require("./lib/uploader");

const util = require("util");
const cron = require("node-cron");
const fetch = require("node-fetch");
const speed = require("performance-now");
const moment = require("moment-timezone");
const { spawn: spawn, exec } = require("child_process");
const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { performance } = require("perf_hooks");
const ytdl = require("ytdl-core");
const colors = require("@colors/colors/safe");
const chalk = require("chalk");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const { toPTT, toAudio } = require("./lib/converter");
const {
  default: makeWaSocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
//  Base
module.exports = async (Rafael, m) => {
  try {
    const from = m.key.remoteJid;
    const quoted = m.quoted ? m.quoted : m;
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage" &&
          m.message.buttonsResponseMessage.selectedButtonId
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage" &&
          m.message.listResponseMessage.singleSelectreply.selectedRowId
        ? m.message.listResponseMessage.singleSelectreply.selectedRowId
        : m.mtype == "templateButtonreplyMessage" &&
          m.message.templateButtonreplyMessage.selectedId
        ? m.message.templateButtonreplyMessage.selectedId
        : m.mtype == "interactiveResponseMessage" &&
          JSON.parse(
            m.message.interactiveResponseMessage.nativeFlowResponseMessage
              .paramsJson
          ).id
        ? JSON.parse(
            m.message.interactiveResponseMessage.nativeFlowResponseMessage
              .paramsJson
          ).id
        : m.mtype == "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId ||
          m.message.listResponseMessage?.singleSelectreply.selectedRowId ||
          m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : ".";
    const isCmd = body.startsWith(prefix);
    const command = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const text = (q = args.join(" "));
    const { type } = m;
    const sender = m.isGroup
      ? m.key.participant
        ? m.key.participant
        : m.participant
      : m.key.remoteJid;
    const botNumber = await Rafael.decodeJid(Rafael.user.id);
    const senderNumber = sender.split("@")[0];
    const isCreator = [
      "6283857564133@s.whatsapp.net",
      botNumber,
      ...global.ownNumb,
    ]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
    const pushname = m.pushName || `${senderNumber}`;
    const isBot = botNumber.includes(senderNumber);
    const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const qmsg = quoted.msg || quoted;
    // Group
    const groupMetadata = m.isGroup
      ? await Rafael.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
    const isGroup = m.key.remoteJid.endsWith("@g.us");
    const groupOwner = m.isGroup ? groupMetadata.owner : "";
    const isGroupOwner = m.isGroup
      ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender)
      : false;
    const isImage = type === "imageMessage";
    const isVideo = type === "videoMessage";
    const isSticker = type == "stickerMessage";
    const isAudio = type == "audioMessage";
    const isViewOnce = type == "viewOnceMessage";
    const isText = type === "conversation" || type === "extendedTextMessage";
    const isQuotedImage =
      type === "extendedTextMessage" && content.includes("imageMessage");
    const isQuotedVideo =
      type === "extendedTextMessage" && content.includes("videoMessage");
    const isQuotedSticker =
      type === "extendedTextMessage" && content.includes("stickerMessage");
    const isQuotedAudio =
      type === "extendedTextMessage" && content.includes("audioMessage");
    const isQuotedViewOnce = m.message.extendedTextMessage?.contextInfo
      ?.quotedMessage?.viewOnceMessageV2
      ? true
      : false;
    //Ini Waktu | Waktu adalah emas,maka dari itu sentuh lah rumput.dan jangan nolep dikamar terus,usahakan tu kontol jangan dikocok terus.Lutut ama sikut lu kopong nanti
    const moment = require("moment-timezone");
    const time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    if (time2 < "19:00:00") {
      var ucapanWaktu = "Selamat Malam🌃";
    }
    if (time2 < "15:00:00") {
      var ucapanWaktu = "Selamat Sore🌄";
    }
    if (time2 < "11:00:00") {
      var ucapanWaktu = "Selamat Siang🏞️";
    }
    if (time2 < "06:00:00") {
      var ucapanWaktu = "Selamat Pagi🏙️ ";
    }
    if (time2 < "23:59:00") {
      var ucapanWaktu = "Selamat Subuh🌆";
    }
    const tanggal = moment().tz("Asia/Jakarta").format("ll");
    const wib = moment(Date.now())
      .tz("Asia/Jakarta")
      .locale("id")
      .format("HH:mm:ss z");
    const wita = moment(Date.now())
      .tz("Asia/Makassar")
      .locale("id")
      .format("HH:mm:ss z");
    const wit = moment(Date.now())
      .tz("Asia/Jayapura")
      .locale("id")
      .format("HH:mm:ss z");
    const salam2 = moment(Date.now())
      .tz("Asia/Jakarta")
      .locale("id")
      .format("a");
    const fkontak = {
      key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        ...(from ? { remoteJid: "status@broadcast" } : {}),
      },
      message: {
        contactMessage: {
          displayName: `Afandi Store`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;RafaelBot,;;;\nFN:${pushname},\nitem1.TEL;waid=${
            sender.split("@")[0]
          }:${sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          jpegThumbnail: {
            url: "https://i.ibb.co.com/x2FS3PF/Whats-App-Image-2024-08-21-at-08-20-28.jpg",
          },
        },
      },
    };
    //Public dan Self
    if (!Rafael.public) {
      if (!isCreator && !m.key.fromMe) return;
    }
    const db_respon_list = JSON.parse(fs.readFileSync("./database/list.json"));
    const {
      addResponList,
      delResponList,
      isAlreadyResponList,
      isAlreadyResponListGroup,
      sendResponList,
      updateResponList,
      getDataResponList,
    } = require("./lib/addlist");
    // Response Addlist
    if (
      m.isGroup &&
      isAlreadyResponList(m.chat, body.toLowerCase(), db_respon_list)
    ) {
      var get_data_respon = getDataResponList(
        m.chat,
        body.toLowerCase(),
        db_respon_list
      );
      if (get_data_respon.isImage === false) {
        Rafael.sendMessage(
          m.chat,
          { text: sendResponList(m.chat, body.toLowerCase(), db_respon_list) },
          {
            quoted: m,
          }
        );
      } else {
        Rafael.sendMessage(
          m.chat,
          {
            image: await getBuffer(get_data_respon.image_url),
            caption: get_data_respon.response,
          },
          {
            quoted: m,
          }
        );
      }
    }

    function rumus(tMatch, tWr, wrReq) {
      let tWin = tMatch * (tWr / 100);
      let tLose = tMatch - tWin;
      let sisaWr = 100 - wrReq;
      let wrResult = 100 / sisaWr;
      let seratusPersen = tLose * wrResult;
      let final = seratusPersen - tMatch;
      return Math.round(final);
    }

    function rumusLose(tMatch, tWr, wrReq) {
      let persen = tWr - wrReq;
      let final = tMatch * (persen / 100);
      return Math.round(final);
    }
    async function dellCase(filePath, caseNameToRemove) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Terjadi kesalahan:", err);
          return;
        }

        const regex = new RegExp(
          `case\\s+'${caseNameToRemove}':[\\s\\S]*?break`,
          "g"
        );
        const modifiedData = data.replace(regex, "");

        fs.writeFile(filePath, modifiedData, "utf8", (err) => {
          if (err) {
            console.error("Terjadi kesalahan saat menulis file:", err);
            return;
          }

          console.log(
            `Teks dari case '${caseNameToRemove}' telah dihapus dari file.`
          );
        });
      });
    }
    const {
      addPremiumUser,
      getPremiumExpired,
      getPremiumPosition,
      expiredPremiumCheck,
      checkPremiumUser,
      getAllPremiumUser,
    } = require("./lib/premiun");
    let premium = JSON.parse(fs.readFileSync("./database/premium.json"));
    const isPremium = isCreator || checkPremiumUser(m.sender, premium);
    expiredPremiumCheck(Rafael, m, premium);

    const rafaelbut = (anu) => {
      const { message, key } = generateWAMessageFromContent(
        m.chat,
        {
          interactiveMessage: {
            body: { text: anu },
            footer: { text: `Rafaelll-Autoai` },
            nativeFlowMessage: {
              buttons: [{ text: "Rafael" }],
            },
          },
        },
        {
          quoted: {
            key: {
              participant: "0@s.whatsapp.net",
              remoteJid: "0@s.whatsapp.net",
            },
            message: { conversation: `${body}` },
          },
        }
      );
      Rafael.relayMessage(
        m.chat,
        { viewOnceMessage: { message } },
        { messageId: key.id }
      );
    };
    // Console
    if (isGroup && isCmd) {
      console.log(
        colors.green.bold("[Group]") +
          " " +
          colors.brightCyan(time2) +
          " " +
          colors.black.bgYellow(command) +
          " " +
          colors.green("from") +
          " " +
          colors.blue(groupName)
      );
    }

    if (!isGroup && isCmd) {
      console.log(
        colors.green.bold("[Private]") +
          " " +
          colors.brightCyan(time2) +
          " " +
          colors.black.bgYellow(command) +
          " " +
          colors.green("from") +
          " " +
          colors.blue(pushname)
      );
    }

    const yts = require("yt-search");
    //
    const { y2mateplay, y2matemp3, y2matemp4 } = require("./lib/y2mate");
    const downloadMp3 = async (Link) => {
      try {
        let yutub = await y2matemp3(Link);
        //if (yutub.size < 62914560) {
        await Rafael.sendMessage(
          m.chat,
          {
            audio: { url: yutub.audio["128"].url },
            mimetype: "audio/mpeg",
            contextInfo: {
              forwardingScore: 9999999,
              isForwarded: true,
              externalAdReply: {
                title: "YOUTUBE - PLAY",
                body: yutub.title,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: yutub.thumbnail,
                sourceUrl: Link,
              },
            },
          },
          { quoted: m }
        );
        /*} else {
await m.reply(`File audio ( ${bytesToSize(yutub.size)} ), telah melebihi batas maksimum!`)
}*/
      } catch (err) {
        console.log(color(err));
      }
    };
    const downloadMp4 = async (Link) => {
      try {
        let yutub = await y2matemp4(Link);
        //if (yutub.size < 104857600) {
        const Cap = `*${yutub.title}*\n\nID: ${yutub.vid}`;
        await Rafael.sendMessage(
          m.chat,
          {
            video: { url: yutub.video["360"].url },
            caption: Cap,
            gifPlayback: false,
          },
          { quoted: m }
        );
        /*} else {
await nw(`File video ( ${bytesToSize(yutub.size)} ), telah melebihi batas maksimum!`)
}*/
      } catch (err) {
        m.reply(`${err}`);
      }
    };

    const fVerif = {
      key: {
        participant: "0@s.whatsapp.net",
        remoteJid: "0@s.whatsapp.net",
      },
      message: { conversation: `_Fixenzo Terverifikasi Oleh WhatsApp_` },
    };
    const reply = async (teks) => {
      Rafael.sendMessage(
        from,
        {
          text: teks,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "Fixenzo - Store",
              newsletterJid: "120363307170529595@g.us",
            },
          },
        },
        { quoted: fVerif }
      );
    };
    const Reply = async (teks) => {
      Rafael.sendMessage(
        from,
        {
          text: teks,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "Fixenzo - Store",
              newsletterJid: "120363307170529595@g.us",
            },
          },
        },
        { quoted: fVerif }
      );
    };

    const tag = `@${m.sender.split("@")[0]}`;
    const totalFitur = () => {
      var mytext = fs.readFileSync("./case.js").toString();
      var numUpper = (mytext.match(/case '/g) || []).length;
      return numUpper;
    };

    if (mek.key.id.startsWith("3EB0")) return;
    switch (command) {
      case "menu":
        {
          let text = `[ *DASHBOARD* ]
⛩️ NameBot: Afandi - Store
⛩️ NameOwner: Afandi Digital
⛩️ TotalFitur: ${totalFitur()}
⛩️ Prefix: [ . ]

[ *MENU DOWNLOAD* ]
• play
• play2
[ *MENU STORE* ]
• list
• addlist
• dellist
• updatelist
• qris
[ *MENU RANDOM* ]
• txt2img
• heroml
• totalfitur
• listcase
[ *MENU GROUP* ]
• kick
• add
• linkgc
• hidetag
• tagall
• promote
• demote
[ *MENU OWNER* ]
• addcase
• delcase
• gantifile
• get
[ *MENU AI* ]
• autoai`;
          Rafael.sendMessage(
            m.chat,
            {
              document: fs.readFileSync("./media/Rafael.png"),
              fileName: `hello ganteng`,
              mimetype: "image/png",
              fileLength: 99999999999,
              jpegThumbnail: fs.readFileSync("./media/Rafael.png"),
              description: "hello",
              caption: text,
              contextInfo: {
                isForwarded: true,
                mentionedJid: [m.sender],
                businessMessageForwardInfo: {
                  businessOwnerJid: global.owner,
                },
                forwardedNewsletterMessageInfo: {
                  newsletterName: `Fixenzo - Store`,
                  newsletterJid: global.idsal,
                },
                externalAdReply: {
                  title: `FIXENZO STORE`,
                  body: `Online On ${runtime(process.uptime())}`,
                  thumbnailUrl:
                    "https://i.ibb.co.com/x2FS3PF/Whats-App-Image-2024-08-21-at-08-20-28.jpg",
                  sourceUrl: `-`,
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
              },
            },
            { quoted: fVerif }
          );
        }
        break;
      case "play":
      case "play2":
        {
          if (!text) return reply(`*Example :* ${prefix + command} Drunk Text`);
          let search = await yts(text);
          let linknya = search.all[0].url;
          reply("sabar");
          downloadMp3(linknya);
        }
        break;
      case "upsaluran":
        if (!m.quoted) return reply(`Reply audio ${prefix}${command}`);
        if (isAudio || !isQuotedAudio) {
          try {
            reply("Done");
            let media = await quoted.download();
            Rafael.sendMessage(global.idsal, { audio: media }, { quoted: m });
          } catch (err) {
            reply(
              `audio tidak di temukan!\nCoba untuk ulangi kirim/reply audio`
            );
          }
        } else reply(`reply audio`);
        break;
      case "listcase":
        {
          let { listCase } = require("./lib/scrapelistCase.js");
          reply(listCase());
        }
        break;
      case "get":
        if (!/^https?:\/\//.test(text))
          return reply("Awali *URL* dengan http:// atau https://");
        const ajg = await fetch(text);
        if (ajg.headers.get("content-length") > 100 * 1024 * 1024 * 1024) {
          throw `Content-Length: ${ajg.headers.get("content-length")}`;
        }
        const contentType = ajg.headers.get("content-type");
        if (contentType.startsWith("image/")) {
          return Rafael.sendMessage(
            m.chat,
            { image: { url: text } },
            "imageMessage",
            text,
            m
          );
        }
        if (contentType.startsWith("video/")) {
          return Rafael.sendMessage(
            m.chat,
            { video: { url: text } },
            "videoMessage",
            text,
            m
          );
        }
        if (contentType.startsWith("audio/")) {
          return Rafael.sendMessage(
            m.chat,
            { audio: { url: text } },
            "audioMessage",
            text,
            m
          );
        }
        let alak = await ajg.buffer();
        try {
          alak = util.format(JSON.parse(alak + ""));
        } catch (e) {
          alak = alak + "";
        } finally {
          reply(alak.slice(0, 65536));
        }
        break;
      case "delcase":
        {
          if (!isCreator) return reply(`*Access Denied ❌*\n\n*Owners only*`);
          if (!q) return reply("*Masukan nama case yang akan di hapus*");

          dellCase("./case.js", q);
          reply("*Dellcase Successfully*\n\n© Dellcase By Fixenzo");
        }
        break;

      case "addcase":
        {
          if (!isCreator) return reply("lu sapa asu");
          if (!text) return reply("Mana case nya");
          const fs = require("fs");
          const namaFile = "case.js";
          const caseBaru = `${text}`;
          fs.readFile(namaFile, "utf8", (err, data) => {
            if (err) {
              console.error("Terjadi kesalahan saat membaca file:", err);
              return;
            }
            const posisiAwalGimage = data.indexOf("case 'addcase':");

            if (posisiAwalGimage !== -1) {
              const kodeBaruLengkap =
                data.slice(0, posisiAwalGimage) +
                "\n" +
                caseBaru +
                "\n" +
                data.slice(posisiAwalGimage);
              fs.writeFile(namaFile, kodeBaruLengkap, "utf8", (err) => {
                if (err) {
                  reply("Terjadi kesalahan saat menulis file:", err);
                } else {
                  reply("Case baru berhasil ditambahkan.");
                }
              });
            } else {
              reply("Tidak dapat menambahkan case dalam file.");
            }
          });
        }
        break;
      case "gimage":
        {
          reply("pajangan");
        }
        break;
      case "done":
      case "d":
        {
          if (!isCreator) return reply("Apaan Si Wir?");
          let teks = m.quoted.text;
          const owned = `${owner}@s.whatsapp.net`;
          const version =
            require("@whiskeysockets/baileys/package.json").version;
          const text12 = `=====================
 *PESANAN SELESAI*
=====================
 DIPROSES: @${sender.split("@")[0]}
 TANGGAL: ${tanggal}
 JAM: ${time2}
 Catatan : ${teks} 
=====================
 
   STATUS : SUKSES✅
    
=====================  
Pesanan Telah Selesai. Di Tunggu Orderan Selanjutnya

Join Ch Ku Wak :
https://chat.whatsapp.com/Cdk8bAMNOYeAKacaUiFFKK
=====================  `;
          Rafael.sendMessage(
            from,
            {
              text: text12,
              contextInfo: {
                mentionedJid: [sender, owned],
                forwardingScore: 9999,
                isForwarded: true,
              },
            },
            { quoted: m }
          );
        }
        break;
      case "heroml":
        {
          if (!text) return reply("example .heroml zilong");
          try {
            let ml = await fetchJson(
              `https://api.vreden.my.id/api/Hero?query=${text}`
            );
            await Rafael.sendMessage(
              m.chat,
              {
                image: { url: ml.anu.hero_img },
                caption: `Name Hero: ${text}
Rilis: ${ml.anu.release}
Role: ${ml.anu.role}
Special: ${ml.anu.specialty}
Lane: ${ml.anu.lane}
Price: ${ml.anu.price}
GameplayInfo: 
durability: ${ml.anu.gameplay_info.durability}
offense: ${ml.anu.gameplay_info.offense}
control_effect: ${ml.anu.gameplay_info.control_effect}
difficulty: ${ml.anu.gameplay_info.difficulty}`,
              },
              { quoted: fVerif }
            );
          } catch (error) {
            console.error(error);
            reply("Error fetching hero information. Please try again later.");
          }
        }
        break;
      case "wanted":
        {
          if (!quoted) return reply(`Where is the picture?`);
          if (!/image/.test(mime))
            return reply(`Send/Reply Photos With Captions ${prefix + command}`);

          reply("sabar");

          try {
            // Download the quoted media
            let media = await Rafael.downloadAndSaveMediaMessage(quoted);
            // Upload the media to get a URL
            let anu = await TelegraPh(media);
            // Fetch the wanted image from the API
            let response = await fetch(
              `https://api.vreden.my.id/api/wanted?url=${anu}`
            );
            let data = await response.json();
            let wantedUrl = data.result; // Make sure this is the correct property in the API response

            // Send the wanted image
            await Rafael.sendMessage(
              m.chat,
              { image: { url: wantedUrl }, caption: "succes" },
              { quoted: fVerif }
            );
          } catch (error) {
            console.error(error);
            reply("An error occurred while processing your request.");
          }
        }
        break;
      case "totalfitur":
      case "totalfeature":
        {
          let fitur = `
*TOTAL FEATURE*

• BerJumlah ${totalFitur()} Fitur\n*Tipe :* Case

Silahkan ketik *.menu* untuk
Menampilkan menu utama`;
          reply(fitur);
        }
        break;
      case "txt2img":
        {
          if (!text) return reply("Example: .txt2img Prompt");
          let anu = `https://api.vreden.my.id/api/text2img?query=${text}`;
          await Rafael.sendMessage(
            m.chat,
            {
              image: { url: anu },
              caption: `*< Success >*\n\n*Prompt :* ${text}`,
            },
            { quoted: fVerif }
          );
        }
        break;
      case "update":
      case "updatelist":
        if (!m.isGroup) return "hanya di dalam grup";
        if (!isAdmins) return "khusus admin";
        var args1 = q.split("|")[0].toLowerCase();
        var args2 = q.split("|")[1];
        if (!q.includes("|"))
          return m.reply(
            `Gunakan Dengan Cara ${prefix + command} Key|Respon\n\nContoh: ${
              prefix + command
            } Tes|Apa`
          );
        if (!isAlreadyResponListGroup(m.chat, db_respon_list))
          return m.reply(
            `Maaf, Tuk Key *${args1}* Belum Terdaftar Digrup Ini!`
          );
        if (/image/.test(mime)) {
          let media = await nw.downloadAndSaveMediaMessage(quoted);
          const fd = new FormData();
          fd.append("file", fs.readFileSync(media), ".tmp", ".jpg");
          fetch("https://telegra.ph/upload", {
            method: "POST",
            body: fd,
          })
            .then((res) => res.json())
            .then((json) => {
              updateResponList(
                m.chat,
                args1,
                args2,
                true,
                `https://telegra.ph${json[0].src}`,
                db_respon_list
              );
              m.reply(`Berhasil Update Respon List Dengan Key *${args1}*`);
              if (fs.existsSync(media)) fs.unlinkSync(media);
            });
        } else {
          updateResponList(m.chat, args1, args2, false, "-", db_respon_list);
          m.reply(`Berhasil Update Respon List Dengan Key *${args1}*`);
        }
        break;
      case "list":
        {
          if (db_respon_list.length === 0)
            return m.reply(`Belum Ada List Respon Didalam Database!`);
          if (!isAlreadyResponListGroup(m.chat, db_respon_list))
            return m.reply(`Belum Ada List Respon Didalam Grup Ini!`);
          let teks = `Halo ${
            db.users[m.sender].nama
          }, Berikut Adalah List Respon Digrup Ini.\n\n`;
          for (let i of db_respon_list) {
            if (i.id === m.chat) {
              teks += `- ${i.key.toUpperCase()}\n`;
            }
          }
          teks += `\n\nTuk Melihat Detail Produk, Silahkan Kirim Nama Produk Yang Ada Didalam List Respon. Misal ${db_respon_list[0].key.toUpperCase()}, Maka Kirim Pesan ${db_respon_list[0].key.toUpperCase()} Kepada Bot`;
          Rafael.sendMessage(
            m.chat,
            { text: teks, mentions: [m.sender] },
            { quoted: m }
          );
        }
        break;
      case "addlist":
        if (!m.isGroup) return "hanya di dalam grup";
        if (!isAdmins) return "khusus admin";
        var args1 = q.split("|")[0].toLowerCase();
        var args2 = q.split("|")[1];
        if (!q.includes("|"))
          return m.reply(
            `Gunakan Dengan Cara ${prefix + command} Key|Respon\n\nContoh: ${
              prefix + command
            } Tes|Apa`
          );
        if (isAlreadyResponList(m.chat, args1, db_respon_list))
          return m.reply(
            `List Respon Dengan Key: ${args1}\nSudah Ada Digrup Ini!`
          );
        if (/image/.test(mime)) {
          let media = await nw.downloadAndSaveMediaMessage(quoted);
          const fd = new FormData();
          fd.append("file", fs.readFileSync(media), ".tmp", ".jpg");
          fetch("https://telegra.ph/upload", {
            method: "POST",
            body: fd,
          })
            .then((res) => res.json())
            .then((json) => {
              addResponList(
                m.chat,
                args1,
                args2,
                true,
                `https://telegra.ph${json[0].src}`,
                db_respon_list
              );
              m.reply(`Sukses Add List Respon\nKey: ${args1}`);
              if (fs.existsSync(media)) fs.unlinkSync(media);
            });
        } else {
          addResponList(m.chat, args1, args2, false, "-", db_respon_list);
          m.reply(`Sukses Add List Respon\nKey: ${args1}`);
        }
        break;
      case "gfl":
      case "gantifile":
        {
          if (!isCreator) return reply(global.mess.owner);
          if (!text.includes("./"))
            return reply(`*• Example* : ${prefix + command} ./package.json`);
          let files = fs.readdirSync(text.split(m.quoted.fileName)[0]);
          if (!files.includes(m.quoted.fileName))
            return reply("File not found");
          let media = await downloadContentFromMessage(m.quoted, "document");
          let buffer = Buffer.from([]);
          for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          fs.writeFileSync(text, buffer);
          reply(`Mengupload`);
          await delay(2000);
          reply(`Berhasil mengganti file ${q}`);
        }
        break;
      case "dellist":
        if (!m.isGroup) return "hanya di dalam grup";
        if (!isAdmins) return "khusus admin";
        if (db_respon_list.length === 0)
          return m.reply(`Belum Ada List Respon Didalam Database!`);
        if (!text)
          return m.reply(
            `Gunakan Dengan Cara ${prefix + command} Key\n\nContoh: ${
              prefix + command
            } Tes`
          );
        if (!isAlreadyResponList(m.chat, q.toLowerCase(), db_respon_list))
          return m.reply(
            `List Respon Dengan Key: ${q}\nTidak Ada Didalam Grup Ini!`
          );
        delResponList(m.chat, q.toLowerCase(), db_respon_list);
        m.reply(`Sukses Del List Respon Dengan Key: ${q}`);
        break;

      case "qris":
        {
          let tekssss = `SCAN QRIS DI ATAS
`;
          Rafael.sendMessage(
            from,
            {
              image: fs.readFileSync(`./media/qris.jpg`),
              caption: tekssss,
              footer: `022`,
            },
            { quoted: fVerif }
          );
        }
        break;

      case "linkgroup":
      case "linkgc":
      case "link":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) reply(mess.botAdmin);
          let response = await Rafael.groupInviteCode(m.chat);
          reply(
            `https://chat.whatsapp.com/${response}\n\nLink Group : ${groupMetadata.subject}`,
            m,
            { detectLink: true }
          );
        }
        break;
      case "kick":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) return reply(mess.botAdmin);
          if (!isAdmins) return reply(mess.admin);
          let users = m.mentionedJid[0]
            ? m.mentionedJid
            : m.quoted
            ? [m.quoted.sender]
            : [text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"];
          await Rafael.groupParticipantsUpdate(m.chat, users, "remove")
            .then((res) => reply(jsonformat(res)))
            .catch((err) => reply(jsonformat(err)));
          reply("*_Success ✅_*");
        }
        break;
      case "add":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) return reply(mess.botAdmin);
          if (!isAdmins) return reply(mess.admin);
          let users = m.mentionedJid[0]
            ? m.mentionedJid
            : m.quoted
            ? [m.quoted.sender]
            : [text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"];
          await Rafael.groupParticipantsUpdate(m.chat, users, "add")
            .then((res) => reply(jsonformat(res)))
            .catch((err) => reply(jsonformat(err)));
          reply("*_Success ✅_*");
        }
        break;
      case "promote":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) return reply(mess.botAdmin);
          if (!isAdmins) return reply(mess.admin);
          let users = m.mentionedJid[0]
            ? m.mentionedJid
            : m.quoted
            ? [m.quoted.sender]
            : [text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"];
          await Rafael.groupParticipantsUpdate(m.chat, users, "promote")
            .then((res) => reply(jsonformat(res)))
            .catch((err) => reply(jsonformat(err)));
          reply("*_Success ✅_*");
        }
        break;
      case "demote":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) return reply(mess.botAdmin);
          if (!isAdmins) return reply(mess.admin);
          let users = m.mentionedJid[0]
            ? m.mentionedJid
            : m.quoted
            ? [m.quoted.sender]
            : [text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"];
          await Rafael.groupParticipantsUpdate(m.chat, users, "demote")
            .then((res) => reply(jsonformat(res)))
            .catch((err) => reply(jsonformat(err)));
          reply("*_Success ✅_*");
        }
        break;
      case "tagall":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isBotAdmins) return reply(mess.botAdmin);
          if (!isAdmins) return reply(mess.admin);
          let teks = `══✪〘 *👥 Tag All* 〙✪══
 
➲ *Pesan : ${q ? q : "kosong"}*\n\n`;
          for (let mem of participants) {
            teks += `⭔ @${mem.id.split("@")[0]}\n`;
          }
          Rafael.sendMessage(
            m.chat,
            { text: teks, mentions: participants.map((a) => a.id) },
            { quoted: m }
          );
        }
        break;
      case "autoai":
        {
          if (!text) throw `*• Example:* .autoai *[on/off]*`;
          if (text == "on") {
            Rafael.elxyz[m.chat] = {
              pesan: [],
            };
            m.reply("[ ✓ ] Success create session chat");
          } else if (text == "off") {
            delete Rafael.elxyz[m.chat];
            m.reply("[ ✓ ] Success delete session chat");
          }
        }
        break;
      case "hidetag":
        {
          if (!m.isGroup) return reply(mess.group);
          if (!isCreator) return reply(mess.owner);
          Rafael.sendMessage(
            m.chat,
            { text: q ? q : "", mentions: participants.map((a) => a.id) },
            { quoted: m }
          );
        }
        break;
      default:
        if (body.startsWith(">")) {
          if (!isCreator) return reply(`*[ System Notice ]* cannot access`);
          try {
            let evaled = await eval(body.slice(2));
            if (typeof evaled !== "string")
              evaled = require("util").inspect(evaled);
            await reply(evaled);
          } catch (err) {
            reply(String(err));
          }
        }
        Rafael.elxyz = Rafael.elxyz ? Rafael.elxyz : {};
        if (m.isBaileys && m.fromMe) return;
        if (!m.text) return;
        if (!Rafael.elxyz[m.chat]) return;
        const prompt = m.text;
        let sessions = {};
        let aiStatus = {};
        if (!prompt || prompt.startsWith("/"))
          if (!Rafael.elxyz[m.chat]) return;

        console.log(
          `[${moment().format("HH:mm")}] from @${pushname}: ${prompt}`
        );

        try {
          const now = moment().tz("Asia/Jakarta");
          const jam = now.format("HH:mm");
          const tgl = now.format("DD-MM-YYYY");
          const hari = now.format("dddd");
          let postData = {
            prompt: prompt,
            sessionId: `${m.sender}`,
            character: `kamu adalah Linda, kamu merupakan ai yang di ciptakan oleh Afandi, ubah cara bicaramu menjadi kekinian namun tetap sopan, @6289663455926 adalah Afandi, jika dia bicara padamu ubah cara bicaramu menjadi manja, kamu di program untuk membantu manusia dalam menyelesaikan masalah, kamu menyebut dirimu itu caca`,
          };

          let response = await axios({
            url: "https://elxyz.me/api/chat",
            method: "POST",
            data: new URLSearchParams(Object.entries(postData)),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          rafaelbut(response.data.data.answer);
        } catch (error) {
          console.error("Error during chat request:", error);
          return "An error occurred during the chat process.";
        }

        if (body.startsWith("$")) {
          if (!isCreator) return reply(`*[ System Notice ]* cannot access`);
          qur = body.slice(2);
          exec(qur, (err, stdout) => {
            if (err) return reply795(`${err}`);
            if (stdout) {
              reply(stdout);
            }
          });
        }
        if (body.startsWith("<")) {
          if (!isCreator) return reply(`*[ System Notice ]* cannot access`);
          try {
            return m.reply(
              JSON.stringify(eval(`${args.join(" ")}`), null, "\t")
            );
          } catch (e) {
            m.reply(e);
          }
        }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
