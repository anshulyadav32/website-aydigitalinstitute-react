import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  const bucketName = 'aydigital';

  console.log(`Checking for bucket: ${bucketName}...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets.find(b => b.name === bucketName);

  if (!bucketExists) {
    console.log(`Creating public bucket: ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError.message);
      process.exit(1);
    }
    console.log('✅ Bucket created successfully!');
  } else {
    console.log('✅ Bucket already exists.');
  }

  console.log('\n--- STORAGE SETUP COMPLETE ---');
  console.log('Your backend is now ready to upload profile pictures to Supabase Storage.');
}

setupStorage();
