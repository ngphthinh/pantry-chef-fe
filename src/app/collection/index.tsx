// app/collection/index.tsx
import { BackHeader } from "@/components/ui/BackHeader";
import { CollectionList } from "@/components/ui/CollectionList";

export default function CollectionIndexScreen() {
  return (
    <CollectionList
      header={<BackHeader title="Bộ sưu tập" fallbackHref="/more" />}
    />
  );
}
