import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Ensure .env.local is loaded
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function fixAdmin() {
  const adminDiscordId = process.env.ADMIN_DISCORD_ID;

  if (!adminDiscordId) {
    console.error('❌ ADMIN_DISCORD_ID is not set in your .env.local file.');
    return;
  }

  console.log(`🔍 Attempting to set admin status for Discord ID: ${adminDiscordId}`);

  try {
    const user = await prisma.user.findUnique({
      where: { discordId: adminDiscordId },
    });

    if (!user) {
      console.error('❌ User with this Discord ID not found in the database.');
      console.log('💡 Please make sure you have logged in at least once.');
      return;
    }

    if (user.isAdmin && user.membership === 'admin') {
      console.log('✅ User is already an admin.');
    } else {
      console.log('⚠️ User is not an admin. Updating now...');
      const updatedUser = await prisma.user.update({
        where: { discordId: adminDiscordId },
        data: {
          isAdmin: true,
          membership: 'admin',
        },
      });
      console.log('✅ User successfully updated to admin status:');
      console.log(`   - Is Admin: ${updatedUser.isAdmin}`);
      console.log(`   - Membership: ${updatedUser.membership}`);
    }
  } catch (error) {
    console.error('❌ An error occurred while trying to update the user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
