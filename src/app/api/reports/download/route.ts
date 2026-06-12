import { NextResponse } from 'next/server'

export async function GET() {
  const csvContent = [
    'Tanggal,Transaksi Sukses,Pendapatan,Cold Storage Temp',
    '2023-10-01,142,45000000,-22.4 C',
    '2023-10-02,156,52100000,-23.1 C',
    '2023-10-03,138,41800000,-21.8 C',
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="laporan_kongsilogi.csv"',
    },
  })
}
