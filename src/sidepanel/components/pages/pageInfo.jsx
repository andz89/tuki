// src/components/pages/PageInfo.jsx

import FeaturedImages from "../pageInfoContent/featuredImages.jsx";
import PageDetails from "../pageInfoContent/PageDetails.jsx";
import CustomTags from "../pageInfoContent/customTag.jsx";
import ModuleCategory from "../pageInfoContent/ModuleCategory.jsx";
export default function PageInfo() {
  return (
    <div className=" flex flex-col gap-2 mt-1">
      <FeaturedImages />

      <PageDetails />

      <CustomTags />

      <ModuleCategory />
    </div>
  );
}
