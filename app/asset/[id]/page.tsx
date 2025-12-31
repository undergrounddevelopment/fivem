import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AssetView from './asset-view';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const asset = await db.assets.getById(params.id);

  if (!asset) {
    return {
      title: 'Asset Not Found',
    };
  }

  return {
    title: `${asset.title} - FiveM Tools`,
    description: asset.description?.substring(0, 155) || 'A FiveM asset from FiveM Tools.',
    openGraph: {
      title: asset.title,
      description: asset.description?.substring(0, 155) || 'A FiveM asset from FiveM Tools.',
      url: `/asset/${asset.id}`,
      images: asset.thumbnail ? [{ url: asset.thumbnail }] : [],
    },
  };
}

export default async function AssetPage({ params }: Props) {
  const asset = await db.assets.getById(params.id);

  if (!asset) {
    notFound();
  }

  return <AssetView assetData={asset} />;
}
