export PATH=$PATH:/Users/anshulyadav/.nvm/versions/node/v24.14.1/bin

echo "Creating R2 Bucket..."
npx wrangler r2 bucket create aydigital

echo "Applying CORS Policy..."
npx wrangler r2 bucket cors set aydigital --file r2-cors.json

echo "✅ R2 Bucket Configured successfully!"
