import { getAllGames } from '@/lib/db';
import EditGameClient from './EditGameClient';

export async function generateStaticParams() {
  const games = await getAllGames();
  return games.map((game) => ({
    id: game.id,
  }));
}

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditGameClient gameId={id} />;
}
