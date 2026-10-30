import { BackHeader } from "@/components/ui/BackHeader";
import { CollectionList } from "@/components/ui/CollectionList";
import { Screen } from "@/components/ui/Screen";

export default function CollectionIndexScreen() {
    return (
        <Screen>
            <BackHeader title="Bộ sưu tập" fallbackHref="/more" />
            <CollectionList />
        </Screen>
    );
}