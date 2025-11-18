// src/components/pages/PageInfo.jsx

import FeaturedImages from "../features/featuredImages/featuredImages.jsx";

import ModuleCategory from "../features/moduleCategory/ModuleCategory.jsx";
import PageMeta from "../features/pageMeta/pageMeta.jsx";
import HyvorTalk from "../features/hyvortalk/HyvorTalk.jsx";
export default function PageInfo() {
  return (
    <div className=" flex flex-col gap-2 mt-1 px-2">
      <FeaturedImages />
      <PageMeta />
      <HyvorTalk />
      <ModuleCategory />
    </div>
  );
}
