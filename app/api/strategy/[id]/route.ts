import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ id: params.id, message: 'Strategy API route' });
}

// This function tells Next.js which dynamic routes to pre-render for static export
export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  return [
    { id: 'strategy-1' },
    { id: 'strategy-2' },
    { id: 'strategy-3' },
    { id: 'strategy-4' },
    { id: 'strategy-5' },
    { id: 'placeholder' }
  ];
}
