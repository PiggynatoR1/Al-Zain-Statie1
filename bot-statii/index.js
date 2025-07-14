require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const allowedRoles = ['Staff'];

let stations = {
  zi: generateCode(),
  actiuni: generateCode(),
  backup: generateCode()
};

function generateCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${String(num).slice(0,3)}.${String(num).slice(3)}`;
}

function createEmbed() {
  return new EmbedBuilder()
    .setTitle("📻 Stațiile zilei")
    .setColor(0x00AEFF)
    .setDescription(`🟡 **Statie Zi**: ${stations.zi}\n🔵 **Statie Actiuni**: ${stations.actiuni}\n🔴 **Statie Backup**: ${stations.backup}\n\n*Apasă pe emoji pentru a genera o nouă stație.*`);
}

client.on('ready', async () => {
  console.log(`Botul e pornit ca ${client.user.tag}`);

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  if (!process.env.MESSAGE_ID) {
    const msg = await channel.send({ embeds: [createEmbed()] });
    await msg.react('🟡');
    await msg.react('🔵');
    await msg.react('🔴');

    console.log(`Mesaj postat: ${msg.id}`);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  const message = await reaction.message.fetch();
  if (message.id !== process.env.MESSAGE_ID) return;

  const member = await message.guild.members.fetch(user.id);
  if (!member.roles.cache.some(role => role.name === allowedRoles[0])) {
    console.log(`Utilizatorul ${user.tag} nu are permisiune.`);
    return;
  }

  switch (reaction.emoji.name) {
    case '🟡':
      stations.zi = generateCode();
      break;
    case '🔵':
      stations.actiuni = generateCode();
      break;
    case '🔴':
      stations.backup = generateCode();
      break;
    default:
      return;
  }

  await message.edit({ embeds: [createEmbed()] });
});

client.login(process.env.TOKEN);