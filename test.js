const { put, head } = require('@vercel/blob');
process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_8vO763zEPZzH1KXR_2CYMIlz2PvhNS4fQynu3QbYb5LTADA';

(async () => {
  const profile = { name: 'Test Builder', role: 'Developer', stack: ['React'], builderTitle: 'Hacker', photo: null };
  const id = 'test-id-123';
  await put(`shares/${id}.json`, JSON.stringify(profile), { access: 'public' });
  console.log('Saved to blob');

  const jsonBlobInfo = await head(`shares/${id}.json`);
  if (jsonBlobInfo && jsonBlobInfo.url) {
    console.log('Found URL:', jsonBlobInfo.url);
    const res = await fetch(jsonBlobInfo.url);
    const data = await res.json();
    console.log('Fetched data:', data);
  }
})();
