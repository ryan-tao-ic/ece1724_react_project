'use client';

import { QRCodeCanvas } from 'qrcode.react';

export default function QrCode({ value }: { value: string }) {
  return (
    <div className="flex justify-center">
      <QRCodeCanvas value={value} size={128} />
    </div>
  );
}
