const { Client, Permissions } = require('discord.js')
const client = new Client()

let privateChannels = [];
let categoryID = "айди категории"
let channelID = "айди канала"
client.on("voiceStateUpdate", async (OLD, NEW) => {
  if((OLD.mute && !NEW.mute) || (NEW.mute && !OLD.mute) || ((OLD.mute && OLD.deaf) && (!NEW.mute && !NEW.deaf)) || (OLD.mute && NEW.mute && NEW.deaf) || (OLD.mute && OLD.deaf && NEW.mute && !NEW.deaf)) return;
  // Создание
  if (NEW.channel != null && NEW.channel.id == channelID) {
    const textChannel = await NEW.guild.channels.create(`Канал ${NEW.member.user.username}`, {
      type: 'text',
      parent: categoryID,
      permissionOverwrites: [
        {
          id: NEW.guild.id,
          deny: ["VIEW_CHANNEL"]
        },
        {
          id: NEW.member.id,
          allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS", "MANAGE_ROLES"]
        }]
    })

    const voiceChannel = await NEW.guild.channels.create(`Канал ${NEW.member.user.username}`, {
      type: 'voice',
      parent: categoryID,
      permissionOverwrites: [
        {
          id: NEW.member.id,
          allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS", "MANAGE_ROLES"],
        }]
    })
    await NEW.member.voice.setChannel(voiceChannel)

    const code = await voiceChannel.createInvite({
      maxAge: 0,
      unique: true
    })
    textChannel.send(`https://discord.gg/${code.code}`)
    privateChannels.push({ voice: voiceChannel.id, text: textChannel.id, owner: NEW.member.id })
  }

  // Выдача прав
  if (NEW.channel != null) {
    const find = privateChannels.filter(s => s.voice == NEW.channel.id)
    if (find.length != 0) {
      const textChannel = client.channels.cache.get(find[0].text)
      await textChannel.createOverwrite(NEW.member.id, {
        "VIEW_CHANNEL": true
      })
    }
  }

  // Удаление прав / удаление канала
  if (OLD.channel != null) {
    const find = privateChannels.filter(s => s.voice == OLD.channel.id)
    if (find.length != 0) {
      const textChannel = client.channels.cache.get(find[0].text)
      if (OLD.channel.members.size == 0) {
        const voiceChannel = client.channels.cache.get(find[0].voice)
        await textChannel.delete()
        await voiceChannel.delete()
      }
      else if (find[0].owner != OLD.member.id) textChannel.permissionOverwrites.get(OLD.member.id)?.delete()
    }
  }
})

client.login("wat")
