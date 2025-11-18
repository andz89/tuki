import React from "react";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import useModuleCategory from "./useModuleCategory";
import ModuleCategoryTemplate from "../../components/templates/ModuleCategory_templates.jsx";

export default function ModuleCategory() {
  const { elements, error } = useModuleCategory();

  if (error) return <AlertBoxElement message={error} type="error" />;
  if (elements.length === 0)
    return (
      <AlertBoxElement
        message="No Speaker Module Category found."
        type="info"
      />
    );

  return (
    <div>
      {elements.map((el, i) => (
        <ModuleCategoryTemplate key={i} element={el} />
      ))}
    </div>
  );
}
