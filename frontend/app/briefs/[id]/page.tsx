'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BriefDetail from '../../../components/briefs/BriefDetail';

export default function BriefDetailPage() {
  const params = useParams();
  const briefId = params?.id as string;
  
  if (!briefId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Brief ID is required</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BriefDetail briefId={briefId} />
    </div>
  );
}