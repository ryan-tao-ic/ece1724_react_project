// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/storage';

export async function GET() {
  const [files] = await bucket.getFiles();
  const fileList = files.map(file => ({
    name: file.name,
    url: file.publicUrl(),
  }));
  return NextResponse.json(fileList);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file || file.size > 1024 * 1024) {
    return NextResponse.json({ error: 'File too large or missing' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = bucket.file(file.name);
  await blob.save(buffer, {
    metadata: { contentType: file.type },
    public: true,
  });

  return NextResponse.json({ success: true, url: blob.publicUrl() });
}