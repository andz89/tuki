import React from "react";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import HyvorTagTemplate from "../../components/templates/HyvorTalk_template.jsx";
import useHyvorTalk from "../../features/hyvorTalk/useHyvorTalk.js";

export default function CustomTags() {
  const { hyvorTag, error } = useHyvorTalk();

  if (error) return <AlertBoxElement message={error} type="error" />;
  if (!hyvorTag)
    return (
      <AlertBoxElement
        message="No hyvor talk comments element found."
        type="info"
      />
    );

  return <HyvorTagTemplate hyvorTag={hyvorTag} />;
}
