import Diary from "@/components/Diary";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { d } = await searchParams;
  return <Diary requested={typeof d === "string" ? d : null} />;
}
