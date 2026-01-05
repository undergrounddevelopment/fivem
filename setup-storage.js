const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual .env.local parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found!');
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  }
}

loadEnv();

// Try multiple variable names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL ||
                    process.env.fivemvip_SUPABASE_URL ||
                    process.env.SUPABASE_URL;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                    process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Supabase URL:', supabaseUrl ? '✅' : '❌');
  console.error('   Service Role Key:', supabaseKey ? '✅' : '❌');
  console.error('\nUsing:', supabaseUrl || 'NOT FOUND');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const bucketExists = buckets?.some(b => b.name === 'uploads');

    if (bucketExists) {
      console.log('✅ Bucket "uploads" already exists');
    } else {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket('uploads', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('❌ Error creating bucket:', error.message);
        return;
      }

      console.log('✅ Bucket "uploads" created successfully');
    }

    // Test upload
    console.log('\n📤 Testing upload...');
    const testFile = Buffer.from('test');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload('test/test.txt', testFile, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
    } else {
      console.log('✅ Upload test successful');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl('test/test.txt');
      
      console.log('📎 Public URL:', publicUrl);

      // Clean up test file
      await supabase.storage.from('uploads').remove(['test/test.txt']);
      console.log('🧹 Test file cleaned up');
    }

    console.log('\n✅ Storage setup complete!\n');
    console.log('📋 Summary:');
    console.log('   - Bucket: uploads');
    console.log('   - Public: Yes');
    console.log('   - Max size: 5MB');
    console.log('   - Allowed: Images only');
    console.log('\n🎉 Ready to upload images!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupStorage();
