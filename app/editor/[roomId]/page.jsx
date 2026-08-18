import EditorLayout from "../../components/EditorLayout";

export default async function EditorPage({ params }) {
  const { roomId } = await params;
  return <EditorLayout roomId={roomId} />;
}
