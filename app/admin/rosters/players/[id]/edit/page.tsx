import { getPlayers } from '@/lib/db';
import EditPlayerClient from './EditPlayerClient';

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map((player) => ({
    id: player.id,
  }));
}

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPlayerClient playerId={id} />;
}
