import fs from 'fs';

const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const profile = {
  name: "Test Builder",
  role: "Engineer",
  stack: ["Next.js", "React"],
  builderTitle: "THE TESTER"
};

async function run() {
  console.log("Testing POST /api/share...");
  const res = await fetch('http://localhost:3000/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: testImage, profile })
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);

  if (!data.id) {
    console.error("No ID returned!");
    process.exit(1);
  }

  const id = data.id;
  console.log(`\nTesting /share/${id} ...`);
  const res2 = await fetch(`http://localhost:3000/share/${id}`);
  console.log("Status:", res2.status);

  console.log(`\nTesting /share/${id}/opengraph-image ...`);
  const res3 = await fetch(`http://localhost:3000/share/${id}/opengraph-image`);
  console.log("Status:", res3.status, "Content-Type:", res3.headers.get('content-type'));

  console.log(`\nTesting /share/${id}/twitter-image ...`);
  const res4 = await fetch(`http://localhost:3000/share/${id}/twitter-image`);
  console.log("Status:", res4.status, "Content-Type:", res4.headers.get('content-type'));
  
  process.exit(0);
}

run().catch(console.error);
